import { Body, Delete, HttpException, HttpStatus, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User } from 'src/app/api/support/users.module';
import { LoggedIn, UserOrAdmin } from 'src/authentication/authentication.guard';
import { AbstractDtoMapper } from './abstract-dto-mapper';
import { AbstractServiceController } from './abstract-service.controller';
import { AbstractEntity } from './abstract.entity';
import { AbstractService } from './abstract.service';

export class AbstractUserServiceController<T extends AbstractEntity, R> extends AbstractServiceController<T, R> {
  constructor(
    readonly service: AbstractService<T>,
    readonly mapper: AbstractDtoMapper<T, R>
  ) {
    super(service, mapper);
  }

  /**
   * Guard method to control create operations at runtime
   * @param dto The DTO being created
   * @param currentUser The currently authenticated user
   * @returns boolean or Promise<boolean> indicating if operation is allowed
   */
  protected canCreate(dto: R, currentUser: User): Promise<boolean> | boolean {
    return true;
  };

  /**
   * Guard method to control update operations at runtime
   * @param id The ID of the entity being updated
   * @param dto The DTO with update data
   * @param currentUser The currently authenticated user
   * @returns boolean or Promise<boolean> indicating if operation is allowed
   */
  protected canUpdate(id: string, dto: R, currentUser: User): Promise<boolean> | boolean {
    return true;
  };

  /**
   * Guard method to control patch operations at runtime
   * @param id The ID of the entity being patched
   * @param dto The DTO with patch data
   * @param currentUser The currently authenticated user
   * @returns boolean or Promise<boolean> indicating if operation is allowed
   */
  protected canPatch(id: string, dto: R, currentUser: User): Promise<boolean> | boolean {
    return true;
  };

  /**
   * Guard method to control delete operations at runtime
   * @param id The ID of the entity being deleted
   * @param currentUser The currently authenticated user
   * @returns boolean or Promise<boolean> indicating if operation is allowed
   */
  protected canDelete(id: string, currentUser: User): Promise<boolean> | boolean {
    return true;
  };

  @Post()
  @UseGuards(LoggedIn, UserOrAdmin)
  async create(@Body() dto: R, @Req() request: Request): Promise<R> {
    const currentUser = (request as any).user as User;

    // Check if create operation is allowed
    const canCreateResult = this.canCreate(dto, currentUser);
    const isAllowed = canCreateResult instanceof Promise ? await canCreateResult : canCreateResult;

    if (!isAllowed) {
      throw new HttpException('Create operation not allowed', HttpStatus.FORBIDDEN);
    }

    return super.create(dto, request);
  }


  @Put(':id')
  @UseGuards(LoggedIn, UserOrAdmin)
  async update(@Param('id') uuid: string, @Body() dto: R, @Req() request: Request): Promise<R> {
    const currentUser = (request as any).user as User;

    // Check if update operation is allowed
    const canUpdateResult = this.canUpdate(uuid, dto, currentUser);
    const isAllowed = canUpdateResult instanceof Promise ? await canUpdateResult : canUpdateResult;

    if (!isAllowed) {
      throw new HttpException('Update operation not allowed', HttpStatus.FORBIDDEN);
    }

    return super.update(uuid, dto, request);
  }

  @Patch(':id')
  @UseGuards(LoggedIn, UserOrAdmin)
  async patch(@Param('id') uuid: string, @Body() dto: R, @Req() request: Request): Promise<R> {
    const currentUser = (request as any).user as User;

    // Check if patch operation is allowed
    const canPatchResult = this.canPatch(uuid, dto, currentUser);
    const isAllowed = canPatchResult instanceof Promise ? await canPatchResult : canPatchResult;

    if (!isAllowed) {
      throw new HttpException('Patch operation not allowed', HttpStatus.FORBIDDEN);
    }

    return super.patch(uuid, dto, request);
  }

  @Delete(':id')
  @UseGuards(LoggedIn, UserOrAdmin)
  async remove(@Param('id') id: string, @Req() request: Request): Promise<boolean> {
    const currentUser = (request as any).user as User;

    // Check if delete operation is allowed
    const canDeleteResult = this.canDelete(id, currentUser);
    const isAllowed = canDeleteResult instanceof Promise ? await canDeleteResult : canDeleteResult;

    if (!isAllowed) {
      throw new HttpException('Delete operation not allowed', HttpStatus.FORBIDDEN);
    }

    return super.remove(id, request);
  }
}