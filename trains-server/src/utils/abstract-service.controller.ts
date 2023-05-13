import { DeepPartial } from "typeorm";
import { PageRequestDto } from '../models/pagination.model';
import { PageDto } from '../models/page.model';
import { AbstractDtoMapper, Mapper } from "./abstract-dto-mapper";
import { AbstractEntity } from "./abstract.entity";
import { AbstractService } from './abstract.service';
import { Body, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Admin, LoggedIn } from '../authentication/authentication.guard';
import { FeatureService } from "./feature.service";

/**
 * T - entity type
 * R - entity dto type
 */
export class AbstractServiceController<T extends AbstractEntity, R> {

  constructor(
    private readonly service: AbstractService<T, R>,
    private readonly mapper: AbstractDtoMapper<T, R>) {}

  @Get(':id')
  @UseGuards(LoggedIn)
  findOne(@Param('id') id: string): Promise<R> {
    return this.service
      .findOne(id)
      .then((domain) => {
        // if domain not found, return 404
        if (!domain) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }

        const found = this.mapper.toDto(domain);

        // mapping can fail too; maybe on econdary entities
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
    return this.service
      .findAll(pagination)
      .then((page) => {
        const mappedData = page?.data?.map((item) => {
          return this.mapper.toDto(item);
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
    const domain = this.mapper.toDomain(dto);
    console.dir(domain);
    return this.service
      .create(domain as any as DeepPartial<T>)
      .then((created) => {
        const createdDto = this.mapper.toDto(created);
        console.dir(createdDto);
        return createdDto;
      })
      .catch((e) => {
        console.dir(e);
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
    return this.service
      .findOne(uuid)
      .then((entity: T) => {
        if (!entity) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }
        return {
          ...this.mapper.toDomain(dto, entity),
          id: uuid, // don't allow id updating
        };
      })
      .then((domain) => this.service.update(uuid, domain))
      .then((updated) => this.mapper.toDto(updated))
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
    return this.service
      .findOne(uuid)
      .then((entity) => {
        if (!entity) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }

        return {
          ...this.mapper.toDomain(dto, entity),
          id: uuid, // don't allow id updating
        };
      })
      .then((entity) => {
        return this.service.update(uuid, entity);
      })
      .then(() => this.service.findOne(uuid))
      .then((updatedEntity) => {
        if (updatedEntity) {
          return this.mapper.toDto(updatedEntity);
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
    return this.service
      .delete(id)
      .catch((e) => {
        if (e instanceof HttpException) {
          throw e;
        } else {
          throw new HttpException('Entity cannot be deleted', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
  }
}
