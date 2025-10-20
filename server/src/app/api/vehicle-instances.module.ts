import { Controller, Get, Injectable, Module, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { omit } from 'lodash';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../utils/abstract.entity';
import { Place, PlacesModule, PlacesService } from './places.module';

import { LoggedIn } from '../../authentication/authentication.guard';
import { PageDto } from '../../models/page.model';
import { AbstractDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../utils/abstract-service.controller';
import { AbstractService } from '../../utils/abstract.service';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../utils/repository-accessor';
import { Vehicle, VehiclesModule, VehiclesService } from './vehicles.module';

@Entity({ name: 'vehicle_instances' })
export class VehicleInstance extends AbstractEntity {
  @ManyToOne(_type => Vehicle, { eager: true })
  @JoinColumn({ name: 'vehicle_id' })
  @Expose()
  vehicle: Vehicle;

  @ManyToOne(_type => Place, { eager: true })
  @JoinColumn({ name: 'start_id' })
  @Expose()
  start: Place;

  @ManyToOne(_type => Place, { eager: true })
  @JoinColumn({ name: 'end_id' })
  @Expose()
  end: Place;

  @Column({ name: 'start_time' })
  @Expose()
  startTime: Date;

  @Column({ name: 'end_time' })
  @Expose()
  endTime: Date;

  @Column({ name: 'game_id' })
  @Expose()
  gameId: string;

  @Column({ name: 'player_id' })
  @Expose()
  playerId: string;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface VehicleInstanceDto {
  id: string;
  vehicleId: string;
  startId: string;
  endId: string;
  startTime: string;
  endTime: string;
  gameId: string;
  playerId: string;
  content: any;
}

@Injectable()
export class VehicleInstanceRepository extends RepositoryAccessor<VehicleInstance> {
  constructor(@InjectRepository(VehicleInstance) injectRepo) {
    super(injectRepo, ['vehicle', 'player']);
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
}

@Injectable()
export class VehicleInstanceMapper extends AbstractDtoMapper<VehicleInstance, VehicleInstanceDto> {
  constructor(
    private readonly placesService: PlacesService,
    private readonly vehiclesService: VehiclesService
  ) {
    super();
  }

  async toDto(domain: VehicleInstance): Promise<VehicleInstanceDto> {
    if (!domain) {
      return null;
    }

    const dto: VehicleInstanceDto = {
      id: domain._id.toString(),
      vehicleId: domain.vehicle?._id.toString(),
      gameId: domain.gameId,
      playerId: domain.playerId,
      startId: domain.start?._id.toString(),
      endId: domain.end?._id.toString(),
      startTime: domain.startTime?.toISOString(),
      endTime: domain.endTime?.toISOString(),
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

    const vehicleId = dto.vehicleId ?? domain.vehicle?._id.toString();
    const startId = dto.startId ?? domain.start?._id.toString();
    const endId = dto.endId ?? domain.end?._id.toString();
    const startTime = dto.startTime ? new Date(dto.startTime) : domain.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : domain.endTime;

    const fixedDto = omit(dto, ['vehicleId', 'playerId', 'mapId', 'startId', 'endId', 'startTime', 'endTime']);

    return {
      ...domain,
      ...fixedDto,
      vehicle: await this.vehiclesService.findOne(vehicleId),
      start: await this.placesService.findOne(startId.toString()),
      end: await this.placesService.findOne(endId.toString()),
      startTime,
      endTime
    } as any as VehicleInstance;
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
}

@Module({
  imports: [PlacesModule, VehiclesModule, TypeOrmModule.forFeature([VehicleInstance])],
  controllers: [VehicleInstancesController],
  providers: [VehicleInstancesService, VehicleInstanceMapper, VehicleInstanceRepository],
  exports: [VehicleInstancesService, VehicleInstanceMapper]
})
export class VehicleInstancesModule {}
