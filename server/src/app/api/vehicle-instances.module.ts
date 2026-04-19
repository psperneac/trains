import { Body, Controller, Get, HttpException, HttpStatus, Injectable, Module, Param, Post, Query, UseFilters, UseGuards, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { omit } from 'lodash';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';

import { AbstractEntity } from '../../utils/abstract.entity';
import { Place, PlacesModule, PlacesService } from './places.module';
import { PlaceInstance, PlaceInstancesModule, PlaceInstancesService } from './place-instance.module';
import { Vehicle, VehiclesModule, VehiclesService } from './vehicles.module';
import { Job, JobType, JobsModule, JobsService } from './jobs.module';

import { LoggedIn } from '../../authentication/authentication.guard';
import { PageDto } from '../../models/page.model';
import { AbstractDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../utils/abstract-service.controller';
import { AbstractService } from '../../utils/abstract.service';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../utils/repository-accessor';

export type VehicleInstanceStatus = 'AT_PLACE' | 'IN_TRANSIT';

@Entity({ name: 'vehicle_instances' })
export class VehicleInstance extends AbstractEntity {
  @Column('objectId')
  @Expose()
  vehicleId: ObjectId;

  @ManyToOne(_type => PlaceInstance, { eager: true })
  @JoinColumn({ name: 'current_place_instance_id' })
  @Expose()
  currentPlaceInstance: PlaceInstance;

  @ManyToOne(_type => PlaceInstance, { eager: true })
  @JoinColumn({ name: 'destination_place_instance_id' })
  @Expose()
  destinationPlaceInstance: PlaceInstance;

  @Column({ type: 'simple-array' })
  @Expose()
  route: ObjectId[];

  @Column({ type: 'varchar', length: 20 })
  @Expose()
  status: VehicleInstanceStatus;

  @Column('objectId')
  @Expose()
  gameId: ObjectId;

  @Column('objectId')
  @Expose()
  playerId: ObjectId;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface VehicleInstanceDto {
  id: string;
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
}

/**
 * Request DTO for loading a job onto a vehicle.
 */
export interface LoadJobDto {
  /** The job ID to load onto the vehicle */
  jobId: string;
}

/**
 * Request DTO for unloading a job from a vehicle at a place.
 */
export interface UnloadJobDto {
  /** The job ID to unload from the vehicle */
  jobId: string;
}

@Injectable()
export class VehicleInstanceRepository extends RepositoryAccessor<VehicleInstance> {
  constructor(@InjectRepository(VehicleInstance) injectRepo) {
    super(injectRepo, ['currentPlaceInstance', 'destinationPlaceInstance']);
  }
}

@Injectable()
export class VehicleInstancesService extends AbstractService<VehicleInstance> {
  constructor(repo: VehicleInstanceRepository) {
    super(repo);
  }

  findAllByPlayerAndMap(pagination: any, playerId: string, mapId: string): Promise<PageDto<VehicleInstance>> {
    return this.findAllWithQuery(
      pagination,
      'vehicle_instances.map.id = :mapId and map_vehicle_instances.player.id = :playerId',
      { mapId, playerId }
    ) as Promise<PageDto<VehicleInstance>>;
  }

  findAllByVehicle(pagination: any, vehicleId: string): Promise<PageDto<VehicleInstance>> {
    return this.findAllWithQuery(pagination, 'vehicle_instances.vehicle.id = :vehicleId', {
      vehicleId
    }) as Promise<PageDto<VehicleInstance>>;
  }

  findAllByPlayer(pagination: any, playerId: string): Promise<PageDto<VehicleInstance>> {
    return this.findAllWhere({ playerId: new Types.ObjectId(playerId) }, pagination);
  }
}

@Injectable()
export class VehicleInstanceMapper extends AbstractDtoMapper<VehicleInstance, VehicleInstanceDto> {
  constructor(
    private readonly placeInstancesService: PlaceInstancesService,
    private readonly vehiclesService: VehiclesService
  ) {
    super();
  }

  async toDto(domain: VehicleInstance): Promise<VehicleInstanceDto> {
    if (!domain) {
      return null;
    }

    const vehicle = domain.vehicleId ? await this.vehiclesService.findOne(domain.vehicleId.toString()) : null;

    const dto: VehicleInstanceDto = {
      id: domain._id.toString(),
      vehicleId: domain.vehicleId?.toString(),
      gameId: domain.gameId.toString(),
      playerId: domain.playerId.toString(),
      currentPlaceInstanceId: domain.currentPlaceInstance?._id.toString(),
      destinationPlaceInstanceId: domain.destinationPlaceInstance?._id.toString(),
      vehicle: vehicle ? {
        id: vehicle._id?.toString(),
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
        gameId: vehicle.gameId?.toString(),
        priceGold: vehicle.priceGold,
        priceGems: vehicle.priceGems,
        fuelBaseBurn: vehicle.fuelBaseBurn,
        fuelPerLoadBurn: vehicle.fuelPerLoadBurn
      } : undefined,
      currentPlaceInstance: domain.currentPlaceInstance ? {
        id: domain.currentPlaceInstance._id?.toString(),
        placeId: domain.currentPlaceInstance.place?._id.toString(),
        gameId: domain.currentPlaceInstance.gameId?.toString(),
        playerId: domain.currentPlaceInstance.playerId?.toString(),
        place: domain.currentPlaceInstance.place ? {
          id: domain.currentPlaceInstance.place._id?.toString(),
          name: domain.currentPlaceInstance.place.name,
          description: domain.currentPlaceInstance.place.description,
          type: domain.currentPlaceInstance.place.type,
          lat: domain.currentPlaceInstance.place.lat,
          lng: domain.currentPlaceInstance.place.lng,
          gameId: domain.currentPlaceInstance.place.gameId?.toString()
        } : undefined,
        jobOffers: domain.currentPlaceInstance.jobOffers,
        content: domain.currentPlaceInstance.content
      } : undefined,
      destinationPlaceInstance: domain.destinationPlaceInstance ? {
        id: domain.destinationPlaceInstance._id?.toString(),
        placeId: domain.destinationPlaceInstance.place?._id.toString(),
        gameId: domain.destinationPlaceInstance.gameId?.toString(),
        playerId: domain.destinationPlaceInstance.playerId?.toString(),
        place: domain.destinationPlaceInstance.place ? {
          id: domain.destinationPlaceInstance.place._id?.toString(),
          name: domain.destinationPlaceInstance.place.name,
          description: domain.destinationPlaceInstance.place.description,
          type: domain.destinationPlaceInstance.place.type,
          lat: domain.destinationPlaceInstance.place.lat,
          lng: domain.destinationPlaceInstance.place.lng,
          gameId: domain.destinationPlaceInstance.place.gameId?.toString()
        } : undefined,
        jobOffers: domain.destinationPlaceInstance.jobOffers,
        content: domain.destinationPlaceInstance.content
      } : undefined,
      route: domain.route?.map(id => id.toString()) ?? [],
      status: domain.status,
      content: domain.content
    };

    return dto;
  }

  async toDomain(
    dto: VehicleInstanceDto,
    domain?: Partial<VehicleInstance> | VehicleInstance
  ): Promise<VehicleInstance> {
    if (!dto) {
      return domain as any as VehicleInstance;
    }

    if (!domain) {
      domain = {};
    }

    const currentPlaceInstanceId = dto.currentPlaceInstanceId ?? domain.currentPlaceInstance?._id.toString();
    const destinationPlaceInstanceId = dto.destinationPlaceInstanceId ?? domain.destinationPlaceInstance?._id.toString();

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
      vehicleId: dto.vehicleId ? new Types.ObjectId(dto.vehicleId) : domain?.vehicleId,
      currentPlaceInstance: await this.placeInstancesService.findOne(currentPlaceInstanceId.toString()),
      destinationPlaceInstance: await this.placeInstancesService.findOne(destinationPlaceInstanceId.toString()),
      route: dto.route?.map(id => new ObjectId(id)) ?? [],
      status: dto.status ?? 'AT_PLACE',
      gameId: dto.gameId ? new Types.ObjectId(dto.gameId) : domain?.gameId,
      playerId: dto.playerId ? new Types.ObjectId(dto.playerId) : domain?.playerId
    } as VehicleInstance;
  }
}

@Controller('vehicle-instances')
@UseFilters(AllExceptionsFilter)
export class VehicleInstancesController extends AbstractServiceController<
  VehicleInstance,
  VehicleInstanceDto
> {
  constructor(
    private readonly vehicleInstancesService: VehicleInstancesService,
    private readonly vehicleInstanceMapper: VehicleInstanceMapper,
    @Inject(forwardRef(() => JobsService))
    private readonly jobsService: JobsService
  ) {
    super(vehicleInstancesService, vehicleInstanceMapper);
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

  /**
   * POST /vehicles/:id/load-job
   * Load a job onto a vehicle. The job must be at the vehicle's current place
   * and must be of type VEHICLE (not yet loaded).
   *
   * @param id - Vehicle instance ID
   * @param loadJobDto - The job ID to load
   * @returns The updated job
   */
  @Post(':id/load-job')
  @UseGuards(LoggedIn)
  async loadJob(
    @Param('id') id: string,
    @Body() loadJobDto: LoadJobDto
  ): Promise<any> {
    const { jobId } = loadJobDto;

    // Get the vehicle
    const vehicle = await this.vehicleInstancesService.findOne(id);
    if (!vehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }

    // Vehicle must be at a place (not in transit)
    if (vehicle.status !== 'AT_PLACE') {
      throw new HttpException('Vehicle must be at a place to load a job', HttpStatus.BAD_REQUEST);
    }

    // Get the job
    const job = await this.jobsService.findOne(jobId);
    if (!job) {
      throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
    }

    // Job must be of type VEHICLE
    if (job.type !== 'VEHICLE') {
      throw new HttpException('Only VEHICLE type jobs can be loaded onto vehicles', HttpStatus.BAD_REQUEST);
    }

    // Job must be at the same place as the vehicle
    if (job.placeInstanceId?.toString() !== vehicle.currentPlaceInstance?._id?.toString()) {
      throw new HttpException('Job is not at the vehicle\'s current location', HttpStatus.BAD_REQUEST);
    }

    // Job must not already be loaded on another vehicle
    if (job.vehicleInstanceId) {
      throw new HttpException('Job is already loaded on another vehicle', HttpStatus.BAD_REQUEST);
    }

    // Update the job to be loaded on this vehicle
    job.vehicleInstanceId = new Types.ObjectId(vehicle._id.toString());
    job.vehicleId = vehicle.vehicleId?.toString();
    job.content = { ...job.content, loadedAt: new Date() };

    await this.jobsService.update(jobId, job);

    return this.jobsService.findOne(jobId).then(j => j);
  }

  /**
   * POST /vehicles/:id/unload-job
   * Unload a job from the vehicle at the current place.
   * The job becomes a PLACE type job at the current location.
   *
   * @param id - Vehicle instance ID
   * @param unloadJobDto - The job ID to unload
   * @returns The updated job
   */
  @Post(':id/unload-job')
  @UseGuards(LoggedIn)
  async unloadJob(
    @Param('id') id: string,
    @Body() unloadJobDto: UnloadJobDto
  ): Promise<any> {
    const { jobId } = unloadJobDto;

    // Get the vehicle
    const vehicle = await this.vehicleInstancesService.findOne(id);
    if (!vehicle) {
      throw new HttpException('Vehicle not found', HttpStatus.NOT_FOUND);
    }

    // Vehicle must be at a place (not in transit)
    if (vehicle.status !== 'AT_PLACE') {
      throw new HttpException('Vehicle must be at a place to unload a job', HttpStatus.BAD_REQUEST);
    }

    // Get the job
    const job = await this.jobsService.findOne(jobId);
    if (!job) {
      throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
    }

    // Job must be loaded on this vehicle
    if (job.vehicleInstanceId?.toString() !== id) {
      throw new HttpException('Job is not loaded on this vehicle', HttpStatus.BAD_REQUEST);
    }

    // Update the job - change to PLACE type at current location
    job.type = JobType.PLACE;
    job.placeInstanceId = new Types.ObjectId(vehicle.currentPlaceInstance._id.toString());
    job.vehicleInstanceId = null;
    job.vehicleId = null;
    job.content = { ...job.content, unloadedAt: new Date() };

    await this.jobsService.update(jobId, job);

    return this.jobsService.findOne(jobId).then(j => j);
  }
}

@Module({
  imports: [PlaceInstancesModule, VehiclesModule, forwardRef(() => JobsModule), TypeOrmModule.forFeature([VehicleInstance])],
  controllers: [VehicleInstancesController],
  providers: [VehicleInstancesService, VehicleInstanceMapper, VehicleInstanceRepository],
  exports: [VehicleInstancesService, VehicleInstanceMapper]
})
export class VehicleInstancesModule {}
