import { HttpException, HttpStatus } from '@nestjs/common';
import { Types } from 'mongoose';
import { DeepPartial, FindOptionsOrder, FindOptionsWhere, FindOptionsUtils, Repository } from 'typeorm';

import { PageDto } from '../models/page.model';
import { PageRequestDto } from '../models/pagination.model';

import { AbstractEntity } from './abstract.entity';
import { RepositoryAccessor } from './repository-accessor';
import { SqlException } from './sql.exception';

/**
 * T - entity type
 */
export class AbstractService<T extends AbstractEntity> {
  repository: Repository<T>;
  relationships: string[];

  constructor(private readonly repositoryAccessor: RepositoryAccessor<T>) {
    this.repository = repositoryAccessor.getRepository();
    this.relationships = repositoryAccessor.getRelationships();
  }

  async findAll(pagination: PageRequestDto): Promise<PageDto<T>> {
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
    const order: FindOptionsOrder<T> | undefined = pagination.sortColumn
      ? { [pagination.sortColumn]: pagination.sortDescending ? 'DESC' : 'ASC' } as FindOptionsOrder<T>
      : undefined;

    const [data, totalCount] = await Promise.all([
      this.repository.find({
        relations: this.relationships,
        skip: pagination.unpaged ? undefined : skip,
        take: pagination.unpaged ? undefined : limit,
        order: order
      }),
      this.repository.count()
    ]);

    const mappedData = data.map(item => ({
      ...item,
      id: item._id?.toString()
    }));

    return {
      data: mappedData,
      page: pagination.unpaged ? page : 1,
      limit: pagination.unpaged ? totalCount : limit,
      totalCount
    };
  }

  async findOne(uuid: string): Promise<T> {
    if (!uuid) {
      return null;
    }

    const data = await this.repository.findOne({
      where: { _id: new Types.ObjectId(uuid) } as unknown as FindOptionsWhere<T>,
      relations: this.relationships
    });

    return data;
  }

  create(entity: DeepPartial<T>): Promise<T> {
    const newData = this.repository.create(entity);
    return this.repository.save(newData as any as DeepPartial<T>, {}) as any;
  }

  update(uuid: string, entity: DeepPartial<T>): Promise<T> {
    const { id: _ignored, ...entityWithoutId } = entity as DeepPartial<T> & { id?: string };

    const updateData = {
      ...entityWithoutId,
      _id: new Types.ObjectId(uuid)
    };

    return this.repository.save(updateData as unknown as DeepPartial<T>) as any;
  }

  async delete(uuid: string): Promise<boolean> {
    return this.repository.delete(uuid).then(deleteResponse => {
      if (!deleteResponse || !deleteResponse.affected) {
        throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
      }

      return true;
    });
  }

  async findAllWhere(whereClause: any, pagination?: PageRequestDto): Promise<PageDto<T>> {
    if (!pagination) {
      pagination = new PageRequestDto();
      pagination.unpaged = true;
    }

    if (!pagination.page || !pagination.limit) {
      pagination.unpaged = true;
    }

    const page = typeof pagination.page === 'string' ? parseInt(pagination.page, 10) : pagination.page || 1;
    const limit = typeof pagination.limit === 'string' ? parseInt(pagination.limit, 10) : pagination.limit || 10;
    const skip = (page - 1) * limit;
    const order = pagination.sortColumn
      ? ({ [pagination.sortColumn]: pagination.sortDescending ? 'DESC' : 'ASC' } as any)
      : undefined;

    const findOptions = {
      where: whereClause as any,
      relations: this.relationships,
      skip: pagination.unpaged ? undefined : skip,
      take: pagination.unpaged ? undefined : limit,
      order: order
    };

    const [data, totalCount] = await Promise.all([
      this.repository.find(findOptions),
      this.repository.countBy(whereClause as any)
    ]);

    const mappedData = data.map(item => ({
      ...item,
      id: item._id?.toString()
    }));

    return {
      data: mappedData,
      page: pagination.unpaged ? 1 : page,
      limit: pagination.unpaged ? totalCount : limit,
      totalCount
    };
  }

  findAllWithQuery(
    pagination: PageRequestDto,
    queryString: string,
    queryParams: any
  ): Promise<PageDto<AbstractEntity>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skippedItems = (page - 1) * limit;

    let query = this.repository.createQueryBuilder('map_place_instances');
    if (this.relationships) {
      // clone relationships because the method empties it
      FindOptionsUtils.applyRelationsRecursively(
        query,
        [...this.relationships],
        query.alias,
        this.repository.metadata,
        ''
      );
    }
    if (!pagination.unpaged) {
      query = query.offset(skippedItems).limit(limit);
    }
    if (pagination.sortColumn) {
      query = query.orderBy(pagination.sortColumn, pagination.sortDescending ? 'DESC' : 'ASC');
    }
    query = query.where(queryString, queryParams);

    return Promise.all([query.getMany(), this.repository.count()]).then(([data, count]) => {
      return {
        data,
        page: pagination.unpaged ? page : 1,
        limit: pagination.unpaged ? count : limit,
        totalCount: count
      };
    });
  }
}
