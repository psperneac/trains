import { PageRequestDto } from '../models/pagination.model';
import { PageDto } from '../models/page.model';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Mapper } from './mapper';

export abstract class AbstractService {
  findAll(pagination: PageRequestDto): Promise<PageDto<any>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skippedItems = (page - 1) * limit;

    return Promise.all([
      this.getRepository().createQueryBuilder().offset(skippedItems).limit(limit).getMany(),
      this.getRepository().count(),
    ]).then(([data, count]) => ({
      data: data.map((d) => this.getMapper().toDto(d)),
      page,
      limit,
      totalCount: count,
    }));
  }

  async findOne(uuid: string): Promise<any> {
    return this.getRepository()
      .findOne(uuid)
      .then((data) => {
        if (!data) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }

        return this.getMapper().toDto(data);
      });
  }

  create(dto): Promise<any> {
    const newData = this.getRepository().create(this.getMapper().toDomain(dto));
    return this.getRepository()
      .save(newData)
      .then((saved) => this.getMapper().toDto(saved));
  }

  update(uuid: string, dto): Promise<any> {
    return this.getRepository()
      .findOne(uuid)
      .then((entity) => {
        if (!entity) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }

        return this.getMapper().toDomain(dto, entity);
      })
      .then((entity) => {
        return this.getRepository().update(uuid, entity);
      })
      .then(() => this.getRepository().findOne(uuid))
      .then((updatedEntity) => {
        if (updatedEntity) {
          return this.getMapper().toDto(updatedEntity);
        }

        throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
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

  public abstract getRepository(): Repository<any>;

  public abstract getMapper(): Mapper<any, any>;
}
