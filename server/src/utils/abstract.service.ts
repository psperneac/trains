import { HttpException, HttpStatus } from '@nestjs/common';
import { DeepPartial, FindOptionsUtils, Repository } from 'typeorm';

import { PageDto } from '../models/page.model';
import { PageRequestDto } from '../models/pagination.model';

import { Types } from 'mongoose';
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

    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      this.repository.find({
        relations: this.relationships,
        skip: pagination.unpaged ? undefined : skip,
        take: pagination.unpaged ? undefined : limit,
        order: pagination.sortColumn ? {
          [pagination.sortColumn]: pagination.sortDescending ? 'DESC' : 'ASC'
        } as any : undefined
      }),
      this.repository.count()
    ]);

    return {
      data,
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
      where: { _id: new Types.ObjectId(uuid) } as any,
      relations: this.relationships
    });

    return data;
  }

  create(entity: DeepPartial<T>): Promise<T> {
    const newData = this.repository.create(entity);
    return this.repository.save(newData as any as DeepPartial<T>, {});
  }

  update(uuid: string, entity): Promise<T> {
    const updatePromise = this.repository.update(uuid, entity);

    return updatePromise.then(updateResult => {
      if (updateResult.affected) {
        return this.findOne(uuid);
      }

      throw new SqlException(updateResult.raw);
    });
  }

  delete(uuid: string): Promise<boolean> {
    return this.repository.delete(uuid).then(deleteResponse => {
      if (!deleteResponse || !deleteResponse.affected) {
        throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
      }

      return true;
    });
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
