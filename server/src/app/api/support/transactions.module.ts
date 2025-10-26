import { Controller, Get, Injectable, Module, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { Column, Entity, ObjectId } from 'typeorm';

import { Types } from 'mongoose';
import { AbstractUserServiceController } from 'src/utils/abstract-user-service.controller';
import { Admin, LoggedIn } from '../../../authentication/authentication.guard';
import { PageDto } from '../../../models/page.model';
import { PageRequestDto } from '../../../models/pagination.model';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';

export enum TransactionType {
  GOLD_GEMS_TRANSFER = 'GOLD_GEMS_TRANSFER',
  ITEM_TRANSFER = 'ITEM_TRANSFER',
  GAME_ACTION = 'GAME_ACTION',
}

export enum EntityType {
  USER = 'USER',
  PLAYER = 'PLAYER',
  GAME = 'GAME',
  PLACE = 'PLACE',
}

@Entity({ name: 'transactions' })
export class Transaction extends AbstractEntity {
  @Column('varchar', { length: 50 })
  @Expose()
  type: TransactionType;

  @Column('objectId')
  @Expose()
  sourceId: ObjectId;

  @Column('varchar', { length: 20 })
  @Expose()
  sourceType: EntityType;

  @Column('objectId')
  @Expose()
  targetId: ObjectId;

  @Column('varchar', { length: 20 })
  @Expose()
  targetType: EntityType;

  @Column({ type: 'json' })
  @Expose()
  payload: any;

  @Column('varchar', { length: 500 })
  @Expose()
  description: string;
}

export interface TransactionDto {
  id: string;
  type: TransactionType;
  sourceId: string;
  sourceType: EntityType;
  targetId: string;
  targetType: EntityType;
  payload: any;
  description: string;
  created: string;
  updated: string;
}

@Injectable()
export class TransactionRepository extends RepositoryAccessor<Transaction> {
  constructor(@InjectRepository(Transaction) injectedRepo) {
    super(injectedRepo);
  }
}

@Injectable()
export class TransactionsService extends AbstractService<Transaction> {
  constructor(repo: TransactionRepository) {
    super(repo);
  }

  async findAllByEntityId(entityId: string, entityType: EntityType, pagination?: PageRequestDto): Promise<PageDto<Transaction>> {
    return this.findAllWhere(
      {
        $or: [
          { sourceId: new Types.ObjectId(entityId), sourceType: entityType },
          { targetId: new Types.ObjectId(entityId), targetType: entityType }
        ]
      },
      pagination
    );
  }

  async findAllByPlayerId(playerId: string, pagination?: PageRequestDto): Promise<PageDto<Transaction>> {
    return this.findAllByEntityId(playerId, EntityType.PLAYER, pagination);
  }

  async createTransaction(
    type: TransactionType,
    sourceId: string,
    sourceType: EntityType,
    targetId: string,
    targetType: EntityType,
    payload: any,
    description: string
  ): Promise<Transaction> {
    const transaction = new Transaction();
    transaction.type = type;
    transaction.sourceId = new Types.ObjectId(sourceId);
    transaction.sourceType = sourceType;
    transaction.targetId = new Types.ObjectId(targetId);
    transaction.targetType = targetType;
    transaction.payload = payload;
    transaction.description = description;

    return this.create(transaction);
  }
}

@Injectable()
export class TransactionMapper extends AbstractDtoMapper<Transaction, TransactionDto> {
  constructor() {
    super();
  }

  async toDto(domain: Transaction): Promise<TransactionDto> {
    if (!domain) {
      return null;
    }

    return {
      id: domain._id.toString(),
      type: domain.type,
      sourceId: domain.sourceId?.toString(),
      sourceType: domain.sourceType,
      targetId: domain.targetId?.toString(),
      targetType: domain.targetType,
      payload: domain.payload,
      description: domain.description,
      created: domain.created?.toISOString(),
      updated: domain.updated?.toISOString(),
    };
  }

  async toDomain(dto: TransactionDto, domain?: Partial<Transaction> | Transaction): Promise<Transaction> {
    if (!dto) {
      return domain as any as Transaction;
    }

    if (!domain) {
      domain = {};
    }

    return {
      ...domain,
      type: dto.type,
      sourceId: dto.sourceId ? new Types.ObjectId(dto.sourceId) : domain?.sourceId,
      sourceType: dto.sourceType,
      targetId: dto.targetId ? new Types.ObjectId(dto.targetId) : domain?.targetId,
      targetType: dto.targetType,
      payload: dto.payload,
      description: dto.description,
      created: dto.created ? new Date(dto.created) : domain?.created,
      updated: dto.updated ? new Date(dto.updated) : domain?.updated,
    } as Transaction;
  }
}

@Controller('transactions')
@UseFilters(AllExceptionsFilter)
export class TransactionController extends AbstractUserServiceController<Transaction, TransactionDto> {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly transactionMapper: TransactionMapper
  ) {
    super(transactionsService, transactionMapper);
  }

  @Get('by-player/:playerId')
  @UseGuards(LoggedIn, Admin)
  async findAllByPlayerId(
    @Param('playerId') playerId: string,
    @Query() pagination: PageRequestDto
  ): Promise<PageDto<TransactionDto>> {
    return this.transactionsService.findAllByPlayerId(playerId, pagination).then(this.makeHandler());
  }

  @Get('by-entity/:entityId/:entityType')
  @UseGuards(LoggedIn, Admin)
  async findAllByEntityId(
    @Param('entityId') entityId: string,
    @Param('entityType') entityType: EntityType,
    @Query() pagination: PageRequestDto
  ): Promise<PageDto<TransactionDto>> {
    return this.transactionsService.findAllByEntityId(entityId, entityType, pagination).then(this.makeHandler());
  }

  @Get()
  @UseGuards(LoggedIn, Admin)
  async findAllTransactions(
    @Query() pagination: PageRequestDto
  ): Promise<PageDto<TransactionDto>> {
    return this.transactionsService.findAll(pagination).then(this.makeHandler());
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [TransactionController],
  providers: [TransactionsService, TransactionMapper, TransactionRepository],
  exports: [TransactionsService, TransactionMapper, TransactionRepository]
})
export class TransactionsModule {}
