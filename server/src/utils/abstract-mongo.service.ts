import { DeepPartial, HydratedDocument, Model, Types } from 'mongoose';
import { AbstractMongoEntity } from './abstract-mongo.entity';
import { Injectable } from '@nestjs/common';
import { PageRequestDto } from '../models/pagination.model';
import { PageDto } from '../models/page.model';
import moment from 'moment';

/**
 * Abstract base service for MongoDB document operations.
 * Provides generic CRUD operations with pagination support.
 *
 * All methods return plain objects (via toObject()) instead of Mongoose documents
 * to avoid exposing internal Mongoose properties ($__, $isNew, _doc, etc.)
 * to downstream code like mappers and controllers.
 *
 * T - entity type extending AbstractMongoEntity
 */
@Injectable()
export class AbstractMongoService<T extends AbstractMongoEntity> {
  constructor(private model: Model<HydratedDocument<T>>) {
  }

  /**
   * Retrieve all documents with optional pagination.
   *
   * @param pagination - PageRequestDto containing page, limit, sortColumn, sortDescending, unpaged
   * @returns PageDto containing array of plain objects (not Mongoose documents)
   */
  findAll(pagination: PageRequestDto): Promise<PageDto<T>> {
    if (!pagination) {
      pagination = new PageRequestDto();
      pagination.unpaged = true;
    }

    if (!pagination.page || !pagination.limit) {
      pagination.unpaged = true;
    }

    // Convert string page and limit to integers if needed
    const page = typeof pagination.page === 'string' ? parseInt(pagination.page, 10) : pagination.page || 1;
    const limit = typeof pagination.limit === 'string' ? parseInt(pagination.limit, 10) : pagination.limit || 10;
    const skip = (page - 1) * limit;
    const order = pagination.sortColumn
      ? (pagination.sortDescending ? '-' : '') + pagination.sortColumn
      : undefined;

    const countQuery = this.model.countDocuments();
    let findQuery = this.model.find();
    if (!pagination.unpaged) {
      findQuery = findQuery.skip(skip).limit(limit);
    }
    if (order) {
      findQuery = findQuery.sort(order);
    }

    // Use Promise.all for parallel query execution (find + count)
    return Promise.all([findQuery.exec(), countQuery.exec()]).then(([data, totalCount]) => {
      // Convert Mongoose documents to plain objects and add string 'id' property
      // This removes internal Mongoose properties ($__, $isNew, _doc, etc.)
      const mappedData = data.map(item => {
        const plain = item.toObject();
        return {
          ...plain,
          id: plain._id?.toString()
        };
      });

      return {
        data: mappedData,
        page: pagination.unpaged ? page : 1,
        limit: pagination.unpaged ? totalCount : limit,
        totalCount
      };
    });
  }

  /**
   * Retrieve documents matching a where clause with optional pagination.
   *
   * @param whereClause - MongoDB query filter (e.g., { name: 'John' })
   * @param pagination - PageRequestDto for pagination options
   * @returns PageDto containing filtered, paginated results as plain objects
   */
  findAllWhere(whereClause: any, pagination?: PageRequestDto): Promise<PageDto<T>> {
    if (!pagination) {
      pagination = new PageRequestDto();
      pagination.unpaged = true;
    }

    if (!pagination.page || !pagination.limit) {
      pagination.unpaged = true;
    }

    // Convert string page and limit to integers if needed
    const page = typeof pagination.page === 'string' ? parseInt(pagination.page, 10) : pagination.page || 1;
    const limit = typeof pagination.limit === 'string' ? parseInt(pagination.limit, 10) : pagination.limit || 10;
    const skip = (page - 1) * limit;
    const order = pagination.sortColumn
      ? (pagination.sortDescending ? '-' : '') + pagination.sortColumn
      : undefined;

    const countQuery = this.model.countDocuments();
    let findQuery = this.model.find(whereClause);
    if (!pagination.unpaged) {
      findQuery = findQuery.skip(skip).limit(limit);
    }
    if (order) {
      findQuery = findQuery.sort(order);
    }

    return Promise.all([findQuery.exec(), countQuery.exec()]).then(([data, totalCount]) => {
      const mappedData = data.map(item => {
        const plain = item.toObject();
        return {
          ...plain,
          id: plain._id?.toString()
        };
      });

      return {
        data: mappedData,
        page: pagination.unpaged ? page : 1,
        limit: pagination.unpaged ? totalCount : limit,
        totalCount
      };
    });
  }

  /**
   * Find a single document by ID.
   *
   * @param id - Document ID (string, Types.ObjectId, or object with toString)
   * @returns Plain object or null if not found
   */
  findOne(id: string | Types.ObjectId | { toString(): string } | null | undefined): Promise<T> {
    return this.model.findById(id).exec().then(doc => {
      if (!doc) return null;
      const plain = doc.toObject();
      return { ...plain, id: plain._id?.toString() } as T;
    });
  }

  /**
   * Create a new document.
   *
   * Sets created and updated timestamps to the same value (moment().toISOString()).
   *
   * @param entity - Partial entity data to create
   * @returns Created document as plain object with string id
   */
  create(entity: DeepPartial<T>): Promise<T> {
    const now = moment().toISOString();
    return new this.model({
      ...entity,
      created: now,
      updated: now
    }).save().then(doc => {
      const plain = doc.toObject();
      return { ...plain, id: plain._id?.toString() } as T;
    });
  }

  /**
   * Update an existing document by ID.
   *
   * Uses { new: true } to return the updated document rather than the pre-update version.
   * Sets the updated timestamp. Does not allow _id to be changed.
   *
   * @param id - Document ID to update
   * @param entity - Partial entity data to update
   * @returns Updated document as plain object, or null if not found
   */
  update(id: string, entity: DeepPartial<T>): Promise<T> {
    const now = moment().toISOString();
    return this.model.findByIdAndUpdate(id, {
      ...entity,
      _id: new Types.ObjectId(id), // Prevent _id from being changed
      updated: now
    }, { new: true }).exec().then(doc => {
      if (!doc) return null;
      const plain = doc.toObject();
      return { ...plain, id: plain._id?.toString() } as T;
    });
  }

  /**
   * Delete a document by ID.
   *
   * @param id - Document ID to delete
   * @returns true if document was deleted, false if not found
   */
  delete(id: string): Promise<boolean> {
    return this.model.findByIdAndDelete(id).exec().then(item => !!item);
  }
}
