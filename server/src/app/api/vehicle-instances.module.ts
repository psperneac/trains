import { Controller, Get, Injectable, Module, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
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
    private readonly vehicleInstanceMapper: VehicleInstanceMapper
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
}

@Module({
  imports: [PlaceInstancesModule, VehiclesModule, TypeOrmModule.forFeature([VehicleInstance])],
  controllers: [VehicleInstancesController],
  providers: [VehicleInstancesService, VehicleInstanceMapper, VehicleInstanceRepository],
  exports: [VehicleInstancesService, VehicleInstanceMapper]
})
export class VehicleInstancesModule {}
