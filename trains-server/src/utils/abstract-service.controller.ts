import { PageRequestDto } from '../models/pagination.model';
import { PageDto } from '../models/page.model';
import { Mapper } from './mapper';
import { AbstractService } from './abstract.service';
import { Body, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Admin, LoggedIn } from '../authentication/authentication.guard';

/**
 * T - entity type
 * R - entity dto type
 */
export abstract class AbstractServiceController<T, R> {
  @Get(':id')
  @UseGuards(LoggedIn)
  findOne(@Param('id') id: string): Promise<R> {
    return this.getService()
      .findOne(id)
      .then((domain) => {
        const found = this.getMapper().toDto(domain);

        if (!found) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }

        return found;
      })
      .catch((e) => {
        if (e instanceof HttpException) {
          throw e;
        } else {
          throw new HttpException('Entity cannot be located', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
  }

  @Get()
  @UseGuards(LoggedIn)
  findAll(@Query() pagination: PageRequestDto): Promise<PageDto<R>> {
    return this.getService()
      .findAll(pagination)
      .then((page) => {
        const mappedData = page?.data?.map((item) => {
          return this.getMapper().toDto(item);
        });
        return {
          ...page,
          data: mappedData,
        };
      });
  }

  @Post()
  @UseGuards(LoggedIn, Admin)
  create(@Body() dto: R): Promise<R> {
    const domain = this.getMapper().toDomain(dto);
    return this.getService()
      .create(domain)
      .then((created) => this.getMapper().toDto(created))
      .catch((e) => {
        if (e instanceof HttpException) {
          throw e;
        } else {
          throw new HttpException('Entity cannot be created', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
  }

  @Put(':id')
  @UseGuards(LoggedIn, Admin)
  update(@Param('id') uuid: string, @Body() dto: R): Promise<R> {
    return this.getService()
      .findOne(uuid)
      .then((entity: T) => {
        if (!entity) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }
        return {
          ...this.getMapper().toDomain(dto, entity),
          id: uuid, // don't allow id updating
        };
      })
      .then((domain) => {
        const service = this.getService();
        return service.update(uuid, domain);
      })
      .then((updated) => this.getMapper().toDto(updated))
      .catch((e) => {
        if (e instanceof HttpException) {
          throw e;
        } else {
          throw new HttpException('Entity cannot be created', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
  }

  @Patch(':id')
  @UseGuards(LoggedIn, Admin)
  patch(@Param('id') uuid: string, @Body() dto: R): Promise<R> {
    return this.getService()
      .findOne(uuid)
      .then((entity) => {
        if (!entity) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }

        return {
          ...this.getMapper().toDomain(dto, entity),
          id: uuid, // don't allow id updating
        };
      })
      .then((entity) => {
        return this.getService().update(uuid, entity);
      })
      .then(() => this.getService().findOne(uuid))
      .then((updatedEntity) => {
        if (updatedEntity) {
          return this.getMapper().toDto(updatedEntity);
        }

        throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
      })
      .catch((e) => {
        if (e instanceof HttpException) {
          throw e;
        } else {
          throw new HttpException('Entity cannot be updated', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
  }

  @Delete(':id')
  @UseGuards(LoggedIn, Admin)
  remove(@Param('id') id: string) {
    return this.getService()
      .delete(id)
      .catch((e) => {
        if (e instanceof HttpException) {
          throw e;
        } else {
          throw new HttpException('Entity cannot be deleted', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
  }

  public abstract getService(): AbstractService<T>;

  public abstract getMapper(): Mapper<T, R>;
}
