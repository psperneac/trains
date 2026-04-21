import { Body, Controller, Get, Injectable, Module, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { LoggedIn } from '../../authentication/authentication.guard';
import { PageDto } from '../../models/page.model';
import { PageRequestDto } from '../../models/pagination.model';
import { AbstractMongoDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractMongoEntity } from '../../utils/abstract-mongo.entity';
import { AbstractMongoService } from '../../utils/abstract-mongo.service';
import { AbstractMongoServiceController } from '../../utils/abstract-mongo-service.controller';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';
import { GamesModule } from './games.module';

/**
 * Supported cargo types in the game.
 * Used by Job entities to specify what type of cargo is being transported.
 */
export const CargoTypes = [
  'Coal',
  'Grain',
  'Electronics',
  'Machinery',
  'Livestock',
  'Lumber',
  'Steel',
  'Textiles',
  'Food',
  'Chemicals',
  'Vehicles',
  'Minerals'
] as const;

/**
 * Type alias for cargo type values.
 */
export type CargoType = (typeof CargoTypes)[number];

@Schema({ collection: 'vehicles' })
export class Vehicle extends AbstractMongoEntity {
  @Prop({ required: true })
  @Expose()
  type: string;

  @Prop({ required: true })
  @Expose()
  name: string;

  @Prop()
  @Expose()
  description: string;

  @Prop({ type: Object })
  @Expose()
  content: any;

  @Prop({ default: 0 })
  @Expose()
  engineMax: number;

  @Prop({ default: 0 })
  @Expose()
  engineLoad: number;

  @Prop({ default: 0 })
  @Expose()
  engineFuel: number;

  @Prop({ default: 0 })
  @Expose()
  auxMax: number;

  @Prop({ default: 0 })
  @Expose()
  auxLoad: number;

  @Prop({ default: 0 })
  @Expose()
  auxFuel: number;

  @Prop({ default: 0 })
  @Expose()
  speed: number;

  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  @Expose()
  gameId: Types.ObjectId;

  @Prop({ default: 5000 })
  @Expose()
  priceGold: number;

  @Prop({ default: 10 })
  @Expose()
  priceGems: number;

  @Prop({ default: 1 })
  @Expose()
  fuelBaseBurn: number;

  @Prop({ default: 0.1 })
  @Expose()
  fuelPerLoadBurn: number;
}

export type VehicleDocument = HydratedDocument<Vehicle>;
export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

export interface VehicleDto {
  id?: string;
  type: string;
  name: string;
  description: string;
  content: any;
  engineMax: number;
  engineLoad: number;
  engineFuel: number;
  auxMax: number;
  auxLoad: number;
  auxFuel: number;
  speed: number;
  gameId: string;
  priceGold: number;
  priceGems: number;
  fuelBaseBurn: number;
  fuelPerLoadBurn: number;
  created?: string;
  updated?: string;
}

@Injectable()
export class VehiclesService extends AbstractMongoService<Vehicle> {
  constructor(@InjectModel(Vehicle.name) private readonly vehicleModel: Model<VehicleDocument>) {
    super(vehicleModel);
  }

  async findByGameId(gameId: string, pagination?: PageRequestDto): Promise<PageDto<Vehicle>> {
    return this.findAllWhere({ gameId: new Types.ObjectId(gameId) }, pagination);
  }
}

@Injectable()
export class VehicleMapper extends AbstractMongoDtoMapper<Vehicle, VehicleDto> {
  async toDto(domain: Vehicle): Promise<VehicleDto> {
    if (!domain) {
      return null;
    }

    return {
      id: (domain as any).id || (domain as any)._id?.toString(),
      type: domain.type,
      name: domain.name,
      description: domain.description,
      content: domain.content,
      engineMax: domain.engineMax,
      engineLoad: domain.engineLoad,
      engineFuel: domain.engineFuel,
      auxMax: domain.auxMax,
      auxLoad: domain.auxLoad,
      auxFuel: domain.auxFuel,
      speed: domain.speed,
      gameId: domain.gameId?.toString(),
      priceGold: domain.priceGold,
      priceGems: domain.priceGems,
      fuelBaseBurn: domain.fuelBaseBurn,
      fuelPerLoadBurn: domain.fuelPerLoadBurn,
      created: domain.created?.toISOString(),
      updated: domain.updated?.toISOString(),
    };
  }

  async toDomain(dto: VehicleDto, domain?: Vehicle | Partial<Vehicle>): Promise<Vehicle> {
    if (!dto) {
      return domain as Vehicle;
    }

    if (!domain) {
      domain = {} as Partial<Vehicle>;
    }

    const { gameId, ...fixedDto } = dto;

    return {
      ...domain,
      ...fixedDto,
      gameId: gameId ? new Types.ObjectId(gameId) : (domain as any).gameId,
    } as Vehicle;
  }
}

@Controller('vehicles')
@UseFilters(AllExceptionsFilter)
export class VehiclesController extends AbstractMongoServiceController<Vehicle, VehicleDto> {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly vehicleMapper: VehicleMapper
  ) {
    super(vehiclesService, vehicleMapper);
  }

  @Get('game/:gameId')
  @UseGuards(LoggedIn)
  async findByGameId(
    @Param('gameId') gameId: string,
    @Query() pagination: PageRequestDto
  ): Promise<PageDto<VehicleDto>> {
    const page = await this.vehiclesService.findByGameId(gameId, pagination);
    return this.handlePagedResults(page, this.vehicleMapper);
  }
}

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vehicle.name, schema: VehicleSchema }]),
    GamesModule
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService, VehicleMapper],
  exports: [VehiclesService, VehicleMapper]
})
export class VehiclesModule {}
