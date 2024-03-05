import { DeepPartial } from 'typeorm';
import { PageRequestDto } from '../models/pagination.model';
import { PageDto } from '../models/page.model';
import { AbstractDtoMapper } from './abstract-dto-mapper';
import { AbstractEntity } from './abstract.entity';
import { AbstractService } from './abstract.service';
import { Body, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Admin, LoggedIn } from '../authentication/authentication.guard';

/**
 * T - entity type
 * R - entity dto type
 */
export class AbstractServiceController<T extends AbstractEntity, R> {
  constructor(readonly service: AbstractService<T>, readonly mapper: AbstractDtoMapper<T, R>) {}

  @Get(':id')
  @UseGuards(LoggedIn)
  public async findOne(@Param('id') id: string): Promise<R> {
    return this.service
      .findOne(id)
      .then(async domain => {
        // if domain not found, return 404
        if (!domain) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }

        const found = await this.mapper.toDto(domain);

        // mapping can fail too; maybe on secondary entities
        if (!found) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }

        return found;
      })
      .catch(e => {
        if (e instanceof HttpException) {
          throw e;
        } else if (e instanceof Error) {
          throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          throw new HttpException('Entity cannot be located', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
  }

  @Get()
  @UseGuards(LoggedIn)
  async findAll(@Query() pagination: PageRequestDto): Promise<PageDto<R>> {
    console.log('findAll', pagination, this.service, this.mapper);

    return this.service
      .findAll(pagination)
      .then(this.makeHandler());
  }

  /**
   * This is a helper function to create a closured handler for findAll containing the mapper instance
   */
  public makeHandler() {
    return (page) => this.handlePagedResults(page, this.mapper);
  }

  public async handlePagedResults(page, mapper) {
    return Promise.all(page?.data?.map(item => mapper.toDto(item)))
      .then(mappedData => ({
      ...page,
        data: mappedData
      }))
      .catch(e => {
        if (e instanceof HttpException) {
          throw e;
        } else if (e instanceof Error) {
          throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          throw new HttpException('Entities cannot be located', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
}

  @Post()
  @UseGuards(LoggedIn, Admin)
  async create(@Body() dto: R): Promise<R> {
    return this.mapper
      .toDomain(dto)
      .then(domain => this.service.create(domain as any as DeepPartial<T>))
      .then(created => this.mapper.toDto(created))
      .catch(e => {
        if (e instanceof HttpException) {
          throw e;
        } else if (e instanceof Error) {
          throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          throw new HttpException('Entity cannot be created', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
  }

  @Put(':id')
  @UseGuards(LoggedIn, Admin)
  async update(@Param('id') uuid: string, @Body() dto: R): Promise<R> {
    return this.service
      .findOne(uuid)
      .then((entity: T) => {
        if (!entity) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }
        return this.mapper.toDomain(dto, entity);
      })
      .then(domain => {
        return {
          ...domain,
          id: uuid // don't allow id updating
        };
      })
      .then(domain => this.service.update(uuid, domain))
      .then(updated => this.mapper.toDto(updated))
      .catch(e => {
        if (e instanceof HttpException) {
          throw e;
        } else if (e instanceof Error) {
          throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          throw new HttpException('Entity cannot be updated', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
  }

  @Patch(':id')
  @UseGuards(LoggedIn, Admin)
  patch(@Param('id') uuid: string, @Body() dto: R): Promise<R> {
    return this.service
      .findOne(uuid)
      .then(entity => {
        if (!entity) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }

        return {
          ...this.mapper.toDomain(dto, entity),
          id: uuid // don't allow id updating
        };
      })
      .then(entity => {
        return this.service.update(uuid, entity);
      })
      .then(() => this.service.findOne(uuid))
      .then(updatedEntity => {
        if (updatedEntity) {
          return this.mapper.toDto(updatedEntity);
        }

        throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
      })
      .catch(e => {
        if (e instanceof HttpException) {
          throw e;
        } else if (e instanceof Error) {
          throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          throw new HttpException('Entity cannot be updated', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
  }

  @Delete(':id')
  @UseGuards(LoggedIn, Admin)
  remove(@Param('id') id: string) {
    return this.service.delete(id).catch(e => {
      if (e instanceof HttpException) {
        throw e;
      } else if (e instanceof Error) {
        throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new HttpException('Entity cannot be deleted', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  }
}
