import { Controller, Get, Injectable, Module, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { LoggedIn } from '../../../authentication/authentication.guard';
import { PageDto } from '../../../models/page.model';
import { PageRequestDto } from '../../../models/pagination.model';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractMongoEntity } from '../../../utils/abstract-mongo.entity';
import { AbstractMongoService } from '../../../utils/abstract-mongo.service';
import { AbstractMongoServiceController } from '../../../utils/abstract-mongo-service.controller';
import { InjectModel } from '@nestjs/mongoose';
import { Model, HydratedDocument, DeepPartial } from 'mongoose';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';

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

@Schema({ collection: 'transactions' })
export class Transaction extends AbstractMongoEntity {
  @Prop({ type: String, enum: TransactionType, required: true })
  @Expose()
  type: TransactionType;

  @Prop({ type: Types.ObjectId, required: true })
  @Expose()
  sourceId: Types.ObjectId;

  @Prop({ type: String, enum: EntityType, required: true })
  @Expose()
  sourceType: EntityType;

  @Prop({ type: Types.ObjectId, required: true })
  @Expose()
  targetId: Types.ObjectId;

  @Prop({ type: String, enum: EntityType, required: true })
  @Expose()
  targetType: EntityType;

  @Prop({ type: Object })
  @Expose()
  payload: any;

  @Prop({ type: String })
  @Expose()
  description: string;
}

export type TransactionDocument = HydratedDocument<Transaction>;
export const TransactionSchema = SchemaFactory.createForClass(Transaction);

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
export class TransactionsService extends AbstractMongoService<Transaction> {
  constructor(@InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>) {
    super(transactionModel);
  }

  async findAllByEntityId(entityId: string, entityType: EntityType, pagination?: PageRequestDto): Promise<PageDto<Transaction>> {
    return this.findAllWhere(
      {
        $or: [
          { sourceId: new ObjectId(entityId), sourceType: entityType },
          { targetId: new ObjectId(entityId), targetType: entityType }
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
    return this.create({
      type,
      sourceId: new ObjectId(sourceId),
      sourceType,
      targetId: new ObjectId(targetId),
      targetType,
      payload,
      description
    } as DeepPartial<Transaction>);
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
      id: (domain as any).id || (domain as any)._id?.toString(),
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

  async toDomain(dto: TransactionDto, domain?: Transaction | Partial<Transaction>): Promise<Transaction> {
    if (!dto) {
      return domain as any as Transaction;
    }

    if (!domain) {
      domain = {} as Partial<Transaction>;
    }

    return {
      ...domain,
      type: dto.type,
      sourceId: dto.sourceId ? new ObjectId(dto.sourceId) : (domain as any).sourceId,
      sourceType: dto.sourceType,
      targetId: dto.targetId ? new ObjectId(dto.targetId) : (domain as any).targetId,
      targetType: dto.targetType,
      payload: dto.payload,
      description: dto.description,
      created: dto.created ? new Date(dto.created) : (domain as any).created,
      updated: dto.updated ? new Date(dto.updated) : (domain as any).updated,
    } as Transaction;
  }
}

@Controller('transactions')
@UseFilters(AllExceptionsFilter)
export class TransactionController extends AbstractMongoServiceController<Transaction, TransactionDto> {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly transactionMapper: TransactionMapper
  ) {
    super(transactionsService, transactionMapper);
  }

  @Get('by-player/:playerId')
  @UseGuards(LoggedIn)
  async findAllByPlayerId(
    @Param('playerId') playerId: string,
    @Query() pagination: PageRequestDto
  ): Promise<PageDto<TransactionDto>> {
    return this.transactionsService.findAllByPlayerId(playerId, pagination).then(this.makeHandler());
  }

  @Get('by-entity/:entityId/:entityType')
  @UseGuards(LoggedIn)
  async findAllByEntityId(
    @Param('entityId') entityId: string,
    @Param('entityType') entityType: EntityType,
    @Query() pagination: PageRequestDto
  ): Promise<PageDto<TransactionDto>> {
    return this.transactionsService.findAllByEntityId(entityId, entityType, pagination).then(this.makeHandler());
  }
}

@Module({
  imports: [MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }])],
  controllers: [TransactionController],
  providers: [TransactionsService, TransactionMapper],
  exports: [TransactionsService, TransactionMapper]
})
export class TransactionsModule {}
