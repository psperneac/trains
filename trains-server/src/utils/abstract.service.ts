import { VehicleRepository } from "../app/api/vehicles/vehicles.module";
import { PageRequestDto } from '../models/pagination.model';
import { PageDto } from '../models/page.model';
import { DeepPartial, Entity, Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AbstractEntity } from "./abstract.entity";
import { RepositoryAccessor } from "./repository-accessor";
import { SqlException } from './sql.exception';

/**
 * T - entity type
 */
export class AbstractService<T extends AbstractEntity,R> {

  repository: Repository<T>;

  constructor(private readonly repositoryAccessor: RepositoryAccessor<T>) {
    this.repository = repositoryAccessor.getRepository();
  }

  findAll(pagination: PageRequestDto): Promise<PageDto<T>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skippedItems = (page - 1) * limit;

    let query = this.repository.createQueryBuilder();
    if (!pagination.unpaged) {
      query = query.offset(skippedItems).limit(limit);
    }
    if (pagination.sortColumn) {
      query = query.orderBy(pagination.sortColumn, pagination.sortDescending ? 'DESC' : 'ASC');
    }

    return Promise.all([query.getMany(), this.repository.count()]).then(([data, count]) => ({
      data,
      page: pagination.unpaged ? page : 1,
      limit: pagination.unpaged ? limit : count,
      totalCount: count,
    }));
  }

  async findOne(uuid: string): Promise<T> {
    return this.repository.findOne(uuid);
  }

  create(entity: DeepPartial<T>): Promise<T> {
    const newData = this.repository.create(entity);
    return this.repository.save(newData as any as DeepPartial<T>, {});
  }

  update(uuid: string, entity): Promise<T> {
    const updatePromise = this.repository.update(uuid, entity);

    return updatePromise.then((updateResult) => {
      if (updateResult.affected) {
        return this.findOne(uuid);
      }

      throw new SqlException(updateResult.raw);
    });
  }

  delete(uuid: string): Promise<boolean> {
    return this.repository
      .delete(uuid)
      .then((deleteResponse) => {
        if (!deleteResponse || !deleteResponse.affected) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }

        return true;
      });
  }
}
