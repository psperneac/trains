import {
  Body,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { Request } from 'express';

import { Admin, LoggedIn } from '../authentication/authentication.guard';
import { PageDto } from '../models/page.model';
import { PageRequestDto } from '../models/pagination.model';

import { AbstractMongoDtoMapper } from './abstract-dto-mapper';
import { AbstractMongoEntity } from './abstract-mongo.entity';
import { AbstractMongoService } from './abstract-mongo.service';
import { DeepPartial, Types } from 'mongoose';

/**
 * Abstract base controller for MongoDB document REST endpoints.
 *
 * Provides standard CRUD operations:
 * - GET    /:id     - findOne
 * - GET    /        - findAll (with pagination)
 * - POST   /        - create (Admin only)
 * - PUT    /:id     - update/replace (Admin only)
 * - PATCH  /:id     - patch/partial update (Admin only)
 * - DELETE /:id     - remove (Admin only)
 *
 * T - entity type extending AbstractMongoEntity
 * R - DTO type for API requests/responses
 */
export class AbstractMongoServiceController<T extends AbstractMongoEntity, R> {
  constructor(
    readonly service: AbstractMongoService<T>,
    readonly mapper: AbstractMongoDtoMapper<T, R>
  ) {}

  /**
   * GET /:id
   * Retrieve a single entity by ID.
   *
   * @param id - Entity ID from URL path
   * @returns DTO representation of the entity
   * @throws 404 if entity not found
   * @throws 500 on errors
   */
  @Get(':id')
  @UseGuards(LoggedIn)
  public async findOne(@Param('id') id: string): Promise<R> {
    return this.service
      .findOne(id)
      .then(async domain => {
        if (!domain) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }

        const found = await this.mapper.toDto(domain);

        // Mapper can return null for secondary entities that don't exist
        if (!found) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }

        return found;
      })
      .catch(e => {
        // Re-throw HttpExceptions as-is to preserve status codes
        if (e instanceof HttpException) {
          throw e;
        } else if (e instanceof Error) {
          throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
          throw new HttpException('Entity cannot be located', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
  }

  /**
   * GET /
   * Retrieve all entities with optional pagination.
   *
   * @param pagination - Query params: page, limit, sortColumn, sortDescending, unpaged
   * @returns PageDto containing array of DTOs
   */
  @Get()
  @UseGuards(LoggedIn)
  async findAll(@Query() pagination: PageRequestDto): Promise<PageDto<R>> {
    return this.service.findAll(pagination).then(this.makeHandler());
  }

  /**
   * Creates a closure containing the mapper for handling paged results.
   * This avoids passing the mapper as a parameter through the Promise chain.
   *
   * @returns Function that transforms PageDto data using the mapper
   */
  public makeHandler() {
    return page => this.handlePagedResults(page, this.mapper);
  }

  /**
   * Maps all items in a page result using the provided mapper.
   * Handles null/undefined page gracefully.
   *
   * @param page - PageDto with data array
   * @param mapper - DTO mapper instance
   * @returns PageDto with mapped data array
   */
  public async handlePagedResults(page, mapper) {
    const mappedData = await Promise.all(page?.data?.map(async item => {
      return await mapper.toDto(item);
    }));

    return {
      ...page,
      data: mappedData
    };
  }

  /**
   * POST /
   * Create a new entity.
   *
   * @param dto - DTO from request body
   * @param _request - Express request (unused, for signature consistency)
   * @returns Created entity as DTO
   * @throws 500 on creation errors
   */
  @Post()
  @UseGuards(LoggedIn, Admin)
  async create(@Body() dto: R, @Req() _request: Request): Promise<R> {
    return this.mapper
      .toDomain(dto)                                    // Convert DTO to domain entity
      .then(domain => this.service.create(domain as any as DeepPartial<T>))  // Create in DB
      .then(created => this.mapper.toDto(created))      // Convert back to DTO
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

  /**
   * PUT /:id
   * Full update/replace of an entity.
   *
   * Fetches existing entity, merges with DTO data (allowing partial updates),
   * then saves. The _id cannot be changed.
   *
   * @param uuid - Entity ID from URL path
   * @param dto - DTO with updated data
   * @param _request - Express request (unused)
   * @returns Updated entity as DTO
   * @throws 404 if entity not found
   * @throws 500 on update errors
   */
  @Put(':id')
  @UseGuards(LoggedIn, Admin)
  async update(@Param('id') uuid: string, @Body() dto: R, @Req() _request: Request): Promise<R> {
    return this.service
      .findOne(uuid)
      .then((entity: T) => {
        if (!entity) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }
        // Merge DTO onto existing entity (partial update allowed)
        return this.mapper.toDomain(dto, entity);
      })
      .then(domain => {
        // Ensure _id cannot be changed - use original ID from URL
        return {
          ...domain,
          _id: new Types.ObjectId(uuid)
        };
      })
      .then(domain => this.service.update(uuid, domain as any as DeepPartial<T>))
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

  /**
   * PATCH /:id
   * Partial update of an entity.
   *
   * Similar to PUT but preserves all existing entity fields,
   * only overriding fields present in the DTO.
   *
   * @param uuid - Entity ID from URL path
   * @param dto - DTO with partial updated data
   * @param _request - Express request (unused)
   * @returns Updated entity as DTO
   * @throws 404 if entity not found
   * @throws 500 on update errors
   */
  @Patch(':id')
  @UseGuards(LoggedIn, Admin)
  async patch(@Param('id') uuid: string, @Body() dto: R, @Req() _request: Request): Promise<R> {
    return this.service
      .findOne(uuid)
      .then(entity => {
        if (!entity) {
          throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
        }
        return entity;
      })
      .then(async entity => this.mapper.toDomain(dto, entity))
      .then(domain => {
        // Store string id in domain for reference, actual _id comes from service.update
        return {
          ...domain,
          id: uuid
        };
      })
      .then(entity => this.service.update(uuid, entity as any as DeepPartial<T>))
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

  /**
   * DELETE /:id
   * Delete an entity.
   *
   * @param id - Entity ID from URL path
   * @param _request - Express request (unused)
   * @returns void (or true on success)
   * @throws 500 on deletion errors
   */
  @Delete(':id')
  @UseGuards(LoggedIn, Admin)
  remove(@Param('id') id: string, @Req() _request: Request) {
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
