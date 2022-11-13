import { PageRequestDto } from '../models/pagination.model';
import { PageDto } from '../models/page.model';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Mapper } from './mapper';
import { SqlException } from './sql.exception';

/**
 * T - entity type
 * R - dto type
 */
export abstract class AbstractService<T> {
  findAll(pagination: PageRequestDto): Promise<PageDto<T>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skippedItems = (page - 1) * limit;

    return Promise.all([
      this.getRepository().createQueryBuilder().offset(skippedItems).limit(limit).getMany(),
      this.getRepository().count(),
    ]).then(([data, count]) => ({
      data,
      page,
      limit,
      totalCount: count,
    }));
  }

  async findOne(uuid: string): Promise<T> {
    return this.getRepository().findOne(uuid);
  }

  create(dto: T): Promise<T> {
    const newData = this.getRepository().create(dto);
    return this.getRepository().save(newData);
  }

  update(uuid: string, entity): Promise<T> {
    return this.getRepository().update(uuid, entity)
      .then((updateResult) => {
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

  public abstract getRepository(): Repository<T>;
}
