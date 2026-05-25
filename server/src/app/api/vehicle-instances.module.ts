import { Body, Controller, forwardRef, Get, HttpException, HttpStatus, Inject, Injectable, Module, Param, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { ConflictException } from '../game/events-gateway/conflict.exception';
import { MongooseModule } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { omit } from 'lodash';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';

import { AbstractMongoDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractMongoEntity } from '../../utils/abstract-mongo.entity';
import { AbstractMongoService } from '../../utils/abstract-mongo.service';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';

import { PlacesModule, PlacesService } from './places.module';
import { PlaceInstancesModule, PlaceInstancesService } from './place-instance.module';
import { VehiclesModule, VehiclesService } from './vehicles.module';
import { JobType, JobsModule, JobsService } from './jobs.module';

import { LoggedIn } from '../../authentication/authentication.guard';
import { PageDto } from '../../models/page.model';

export type VehicleInstanceStatus = 'AT_PLACE' | 'IN_TRANSIT';

@Schema({ collection: 'vehicle_instances' })
export class VehicleInstance extends AbstractMongoEntity {
  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  @Expose()
  vehicleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PlaceInstance' })
  @Expose()
  currentPlaceInstanceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PlaceInstance' })
  @Expose()
  destinationPlaceInstanceId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'PlaceInstance' }] })
  @Expose()
  route: Types.ObjectId[];

  @Prop({ default: 'AT_PLACE' })
  @Expose()
  status: VehicleInstanceStatus;

  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  @Expose()
  gameId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  @Expose()
  playerId: Types.ObjectId;

  @Prop({ type: Object })
  @Expose()
  content: any;

  @Prop({ default: 0 })
  @Expose()
  version: number;
}

export type VehicleInstanceDocument = HydratedDocument<VehicleInstance>;
export const VehicleInstanceSchema = SchemaFactory.createForClass(VehicleInstance);

export interface VehicleInstanceDto {
  id?: string;
  vehicleId: string;
  currentPlaceInstanceId: string;
  destinationPlaceInstanceId: string;
  vehicle?: any;
  currentPlaceInstance?: any;
  destinationPlaceInstance?: any;
  route: string[];
  status: VehicleInstanceStatus;
  gameId: string;
  playerId: string;
  content: any;
  created?: string;
  updated?: string;
}

/**
 * Request DTO for loading a job onto a vehicle.
 */
export interface LoadJobDto {
  jobId: string;
  expectedVehicleVersion: number;
}

/**
 * Request DTO for unloading a job from a vehicle at a place.
 */
export interface UnloadJobDto {
  jobId: string;
}

@Injectable()
export class VehicleInstancesService extends AbstractMongoService<VehicleInstance> {
  constructor(@InjectModel(VehicleInstance.name) private readonly vehicleInstanceModel: Model<VehicleInstanceDocument>) {
    super(vehicleInstanceModel);
  }

  findAllByPlayerAndMap(pagination: any, playerId: string, mapId: string): Promise<PageDto<VehicleInstance>> {
    return this.findAllWhere({ playerId: new Types.ObjectId(playerId) }, pagination);
  }

  findAllByVehicle(pagination: any, vehicleId: string): Promise<PageDto<VehicleInstance>> {
    return this.findAllWhere({ vehicleId: new Types.ObjectId(vehicleId) }, pagination);
  }

  findAllByPlayer(pagination: any, playerId: string): Promise<PageDto<VehicleInstance>> {
    return this.findAllWhere({ playerId: new Types.ObjectId(playerId) }, pagination);
  }
}

@Injectable()
export class VehicleInstanceMapper extends AbstractMongoDtoMapper<VehicleInstance, VehicleInstanceDto> {
  constructor(
    private readonly placeInstancesService: PlaceInstancesService,
    private readonly vehiclesService: VehiclesService,
    private readonly placesService: PlacesService
  ) {
    super();
  }

  private async fetchPlaceData(placeId: Types.ObjectId | string): Promise<any> {
    const place = await this.placesService.findOne(placeId.toString());
    if (!place) return undefined;
    return {
      id: (place as any).id || (place as any)._id?.toString(),
      name: place.name,
      description: place.description,
      type: place.type,
      lat: place.lat,
      lng: place.lng,
      gameId: (place as any).gameId?.toString()
    };
  }

  async toDto(domain: VehicleInstance): Promise<VehicleInstanceDto> {
    if (!domain) {
      return null;
    }

    const vehicle = domain.vehicleId ? await this.vehiclesService.findOne(domain.vehicleId.toString()) : null;

    const currentPlaceInstanceId = domain.currentPlaceInstanceId?.toString?.();
    const destinationPlaceInstanceId = domain.destinationPlaceInstanceId?.toString?.();

    const currentPlaceInstanceData = currentPlaceInstanceId
      ? await this.placeInstancesService.findOne(currentPlaceInstanceId)
      : null;
    const destinationPlaceInstanceData = destinationPlaceInstanceId
      ? await this.placeInstancesService.findOne(destinationPlaceInstanceId)
      : null;

    const dto: VehicleInstanceDto = {
      id: (domain as any).id || (domain as any)._id?.toString(),
      vehicleId: domain.vehicleId?.toString(),
      gameId: domain.gameId?.toString(),
      playerId: domain.playerId?.toString(),
      currentPlaceInstanceId: currentPlaceInstanceId,
      destinationPlaceInstanceId: destinationPlaceInstanceId,
      vehicle: vehicle ? {
        id: (vehicle as any).id || (vehicle as any)._id?.toString(),
        type: vehicle.type,
        name: vehicle.name,
        description: vehicle.description,
        content: vehicle.content,
        engineMax: vehicle.engineMax,
        engineLoad: vehicle.engineLoad,
        engineFuel: vehicle.engineFuel,
        auxMax: vehicle.auxMax,
        auxLoad: vehicle.auxLoad,
        auxFuel: vehicle.auxFuel,
        speed: vehicle.speed,
        gameId: (vehicle as any).gameId?.toString(),
        priceGold: vehicle.priceGold,
        priceGems: vehicle.priceGems,
        fuelBaseBurn: vehicle.fuelBaseBurn,
        fuelPerLoadBurn: vehicle.fuelPerLoadBurn
      } : undefined,
      currentPlaceInstance: currentPlaceInstanceData ? {
        id: (currentPlaceInstanceData as any).id || (currentPlaceInstanceData as any)._id?.toString(),
        placeId: (currentPlaceInstanceData as any).placeId?.toString(),
        gameId: (currentPlaceInstanceData as any).gameId?.toString(),
        playerId: (currentPlaceInstanceData as any).playerId?.toString(),
        place: (currentPlaceInstanceData as any).placeId ? await this.fetchPlaceData((currentPlaceInstanceData as any).placeId) : undefined,
        jobOffers: (currentPlaceInstanceData as any).jobOffers,
        content: (currentPlaceInstanceData as any).content
      } : undefined,
      destinationPlaceInstance: destinationPlaceInstanceData ? {
        id: (destinationPlaceInstanceData as any).id || (destinationPlaceInstanceData as any)._id?.toString(),
        placeId: (destinationPlaceInstanceData as any).placeId?.toString(),
        gameId: (destinationPlaceInstanceData as any).gameId?.toString(),
        playerId: (destinationPlaceInstanceData as any).playerId?.toString(),
        place: (destinationPlaceInstanceData as any).placeId ? await this.fetchPlaceData((destinationPlaceInstanceData as any).placeId) : undefined,
        jobOffers: (destinationPlaceInstanceData as any).jobOffers,
        content: (destinationPlaceInstanceData as any).content
      } : undefined,
      route: domain.route?.map(id => id.toString()) ?? [],
      status: domain.status,
      content: domain.content,
    };

    return dto;
  }

  async toDomain(dto: VehicleInstanceDto, domain?: VehicleInstance | Partial<VehicleInstance>): Promise<VehicleInstance> {
    if (!dto) {
      return domain as VehicleInstance;
    }

    if (!domain) {
      domain = {} as Partial<VehicleInstance>;
    }

    const currentPlaceInstanceId = dto.currentPlaceInstanceId ?? (domain as any).currentPlaceInstanceId?.toString();
    const destinationPlaceInstanceId = dto.destinationPlaceInstanceId ?? (domain as any).destinationPlaceInstanceId?.toString();

    const fixedDto = omit(dto, [
      'playerId',
      'currentPlaceInstanceId',
      'destinationPlaceInstanceId',
      'route',
      'status'
    ]);

    return {
      ...domain,
      ...fixedDto,
      vehicleId: dto.vehicleId ? new Types.ObjectId(dto.vehicleId) : (domain as any).vehicleId,
      currentPlaceInstanceId: currentPlaceInstanceId ? new Types.ObjectId(currentPlaceInstanceId) : null,
      destinationPlaceInstanceId: destinationPlaceInstanceId ? new Types.ObjectId(destinationPlaceInstanceId) : null,
      route: dto.route?.map(id => new Types.ObjectId(id)) ?? [],
      status: dto.status ?? 'AT_PLACE',
      gameId: dto.gameId ? new Types.ObjectId(dto.gameId) : (domain as any).gameId,
      playerId: dto.playerId ? new Types.ObjectId(dto.playerId) : (domain as any).playerId
    } as VehicleInstance;
  }
}

@Controller('vehicle-instances')
@UseFilters(AllExceptionsFilter)
export class VehicleInstancesController {
  constructor(
    private readonly vehicleInstancesService: VehicleInstancesService,
    private readonly vehicleInstanceMapper: VehicleInstanceMapper,
    @Inject(forwardRef(() => JobsService))
    private readonly jobsService: JobsService
  ) {
  }

  @Get('by-player-and-map/:playerId/:mapId')
  @UseGuards(LoggedIn)
  async findAllByPlayerAndMap(
    pagination: any,
    playerId: string,
    mapId: string
  ): Promise<PageDto<VehicleInstanceDto>> {
    return this.vehicleInstancesService.findAllByPlayerAndMap(pagination, playerId, mapId).then(this.makeHandler());
  }

  @Get('by-vehicle/:vehicleId')
  @UseGuards(LoggedIn)
  async findAllByVehicle(pagination: any, vehicleId: string): Promise<PageDto<VehicleInstanceDto>> {
    return this.vehicleInstancesService.findAllByVehicle(pagination, vehicleId).then(this.makeHandler());
  }

  @Get('by-player/:playerId')
  @UseGuards(LoggedIn)
  async findAllByPlayer(
    @Query() pagination: any,
    @Param('playerId') playerId: string
  ): Promise<PageDto<VehicleInstanceDto>> {
    return this.vehicleInstancesService.findAllByPlayer(pagination, playerId).then(this.makeHandler());
  }

  @Get(':id')
  @UseGuards(LoggedIn)
  async findOne(@Param('id') id: string): Promise<VehicleInstanceDto> {
    return this.vehicleInstancesService.findOne(id).then(async domain => {
      if (!domain) {
        throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
      }
      const found = await this.vehicleInstanceMapper.toDto(domain);
      if (!found) {
        throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
      }
      return found;
    });
  }

  @Get()
  @UseGuards(LoggedIn)
  async findAll(@Query() pagination: any): Promise<PageDto<VehicleInstanceDto>> {
    return this.vehicleInstancesService.findAll(pagination).then(this.makeHandler());
  }

  public makeHandler() {
    return (page: PageDto<VehicleInstance>) => this.handlePagedResults(page, this.vehicleInstanceMapper);
  }

  public async handlePagedResults(page: PageDto<VehicleInstance>, mapper: VehicleInstanceMapper) {
    const mappedData = await Promise.all(page?.data?.map(async item => {
      return await mapper.toDto(item);
    }));
    return { ...page, data: mappedData };
  }

  @Post(':id/load-job')
  @UseGuards(LoggedIn)
  async loadJob(
    @Param('id') id: string,
    @Body() loadJobDto: LoadJobDto
  ): Promise<any> {
    const { jobId, expectedVehicleVersion } = loadJobDto;

    const vehicle = await this.vehicleInstancesService.findOne(id);
    if (!vehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }

    if (vehicle.version !== expectedVehicleVersion) {
      throw new ConflictException('stale_vehicle_state', vehicle.version, vehicle);
    }

    if (vehicle.status !== 'AT_PLACE') {
      throw new HttpException('Vehicle must be at a place to load a job', HttpStatus.BAD_REQUEST);
    }

    const job = await this.jobsService.findOne(jobId);
    if (!job) {
      throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
    }

    if (job.type !== 'VEHICLE') {
      throw new HttpException('Only VEHICLE type jobs can be loaded onto vehicles', HttpStatus.BAD_REQUEST);
    }

    const currentPlaceId = vehicle.currentPlaceInstanceId?.toString?.();
    if ((job as any).placeInstanceId?.toString() !== currentPlaceId) {
      throw new HttpException('Job is not at the vehicle\'s current location', HttpStatus.BAD_REQUEST);
    }

    if ((job as any).vehicleInstanceId) {
      throw new HttpException('Job is already loaded on another vehicle', HttpStatus.BAD_REQUEST);
    }

    (job as any).vehicleInstanceId = new Types.ObjectId(vehicle._id.toString());
    (job as any).vehicleId = vehicle.vehicleId?.toString();
    (job as any).content = { ...(job as any).content, loadedAt: new Date() };

    await this.jobsService.update(jobId, job);

    return this.jobsService.findOne(jobId).then(j => j);
  }

  @Post(':id/unload-job')
  @UseGuards(LoggedIn)
  async unloadJob(
    @Param('id') id: string,
    @Body() unloadJobDto: UnloadJobDto
  ): Promise<any> {
    const { jobId } = unloadJobDto;

    const vehicle = await this.vehicleInstancesService.findOne(id);
    if (!vehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }

    if (vehicle.status !== 'AT_PLACE') {
      throw new HttpException('Vehicle must be at a place to unload a job', HttpStatus.BAD_REQUEST);
    }

    const job = await this.jobsService.findOne(jobId);
    if (!job) {
      throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
    }

    if ((job as any).vehicleInstanceId?.toString() !== id) {
      throw new HttpException('Job is not loaded on this vehicle', HttpStatus.BAD_REQUEST);
    }

    (job as any).type = JobType.PLACE;
    (job as any).placeInstanceId = new Types.ObjectId(vehicle.currentPlaceInstanceId.toString());
    (job as any).vehicleInstanceId = null;
    (job as any).vehicleId = null;
    (job as any).content = { ...(job as any).content, unloadedAt: new Date() };

    await this.jobsService.update(jobId, job);

    return this.jobsService.findOne(jobId).then(j => j);
  }
}

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VehicleInstance.name, schema: VehicleInstanceSchema }]),
    PlaceInstancesModule,
    VehiclesModule,
    PlacesModule,
    forwardRef(() => JobsModule),
  ],
  controllers: [VehicleInstancesController],
  providers: [VehicleInstancesService, VehicleInstanceMapper],
  exports: [VehicleInstancesService, VehicleInstanceMapper]
})
export class VehicleInstancesModule {}