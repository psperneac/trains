import { PageRequestDto } from '../models/pagination.model';
import { PageDto } from '../models/page.model';
import { DeepPartial, Entity, Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AbstractEntity } from "./abstract.entity";
import { FeatureService } from "./feature.service";
import { SqlException } from './sql.exception';

/**
 * T - entity type
 */
export class AbstractService<T extends AbstractEntity,R> {

  constructor(private readonly featureService: FeatureService<T,R>) {}

  findAll(pagination: PageRequestDto): Promise<PageDto<T>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skippedItems = (page - 1) * limit;

    let query = this.getRepository().createQueryBuilder();
    if (!pagination.unpaged) {
      query = query.offset(skippedItems).limit(limit);
    }
    if (pagination.sortColumn) {
      query = query.orderBy(pagination.sortColumn, pagination.sortDescending ? 'DESC' : 'ASC');
    }

    return Promise.all([query.getMany(), this.getRepository().count()]).then(([data, count]) => ({
      data,
      page: pagination.unpaged ? page : 1,
      limit: pagination.unpaged ? limit : count,
      totalCount: count,
    }));
  }

  async findOne(uuid: string): Promise<T> {
    return this.getRepository().findOne(uuid);
  }

  create(entity: DeepPartial<T>): Promise<T> {
    const newData = this.getRepository().create(entity);
    return this.getRepository().save(newData as any as DeepPartial<T>, {});
  }

  update(uuid: string, entity): Promise<T> {
    const updatePromise = this.getRepository().update(uuid, entity);

    return updatePromise.then((updateResult) => {
      if (updateResult.affected) {
        return this.findOne(uuid);
      }

      throw new SqlException(updateResult.raw);
    });
  }

  delete(uuid: string): Promise<boolean> {
    return this.getRepository()
      .delete(uuid)
      .then((deleteResponse) => {
        if (!deleteResponse || !deleteResponse.affected) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }

        return true;
      });
  }

  getRepository(): Repository<T> {
    return this.featureService.getRepository();
  }
}
