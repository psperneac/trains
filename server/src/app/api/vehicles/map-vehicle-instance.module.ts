import { Controller, Get, Injectable, Module, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { omit } from 'lodash';
import { LoggedIn } from '../../../authentication/authentication.guard';
import { PageDto } from '../../../models/page.model';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { MapTemplateModule, MapTemplateService } from '../maps/map-template.module';
import { MapPlacesModule, MapPlacesService } from '../places/map-places.module';
import { MapVehicleInstance, MapVehicleInstanceDto } from './map-vehicle-instance.entity';
import { MapVehiclesModule, MapVehiclesService } from './map-vehicles.module';

@Injectable()
export class MapVehicleInstanceRepository extends RepositoryAccessor<MapVehicleInstance> {
  constructor(@InjectRepository(MapVehicleInstance) injectRepo) {
    super(injectRepo, ['mapVehicle', 'player']);
  }
}

@Injectable()
export class MapVehicleInstancesService extends AbstractService<MapVehicleInstance> {
  constructor(repo: MapVehicleInstanceRepository) {
    super(repo);
  }

  findAllByPlayerAndMap(pagination: any, playerId: string, mapId: string): Promise<PageDto<MapVehicleInstance>> {
    return this.findAllWithQuery(
      pagination,
      'map_vehicle_instances.map.id = :mapId and map_vehicle_instances.player.id = :playerId',
      { mapId, playerId }
    ) as Promise<PageDto<MapVehicleInstance>>;
  }

  findAllByVehicle(pagination: any, mapVehicleId: string): Promise<PageDto<MapVehicleInstance>> {
    return this.findAllWithQuery(pagination, 'map_vehicle_instances.mapVehicle.id = :mapVehicleId', {
      mapVehicleId
    }) as Promise<PageDto<MapVehicleInstance>>;
  }
}

@Injectable()
export class MapVehicleInstanceMapper extends AbstractDtoMapper<MapVehicleInstance, MapVehicleInstanceDto> {
  constructor(
    private readonly mapPlacesService: MapPlacesService,
    private readonly mapVehiclesService: MapVehiclesService,
    private readonly mapService: MapTemplateService,
  ) {
    super();
  }

  async toDto(domain: MapVehicleInstance): Promise<MapVehicleInstanceDto> {
    if (!domain) {
      return null;
    }

    const dto: MapVehicleInstanceDto = {
      id: domain.id,
      mapVehicleId: domain.mapVehicle?.id,
      playerId: domain.playerId,
      mapId: domain.map?.id,
      jobs: domain.jobs?.map(j => j.id),
      startId: domain.start?.id,
      endId: domain.end?.id,
      startTime: domain.startTime?.toISOString(),
      endTime: domain.endTime?.toISOString(),
      content: domain.content,
    };

    return dto;
  }

  async toDomain(
    dto: MapVehicleInstanceDto,
    domain?: Partial<MapVehicleInstance> | MapVehicleInstance
  ): Promise<MapVehicleInstance> {
    if (!dto) {
      return domain as any as MapVehicleInstance;
    }

    if (!domain) {
      domain = {};
    }

    const mapVehicleId = dto.mapVehicleId ?? domain.mapVehicle?.id;
    const mapId = dto.mapId ?? domain.map?.id;
    const startId = dto.startId ?? domain.start?.id;
    const endId = dto.endId ?? domain.end?.id;
    const startTime = dto.startTime ? new Date(dto.startTime) : domain.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : domain.endTime;

    const fixedDto = omit(dto, ['vehicleId', 'playerId', 'mapId', 'startId', 'endId', 'startTime', 'endTime']);

    return {
      ...domain,
      ...fixedDto,
      mapVehicle: await this.mapVehiclesService.findOne(mapVehicleId),
      map: await this.mapService.findOne(mapId),
      start: await this.mapPlacesService.findOne(startId),
      end: await this.mapPlacesService.findOne(endId),
      startTime,
      endTime
    } as any as MapVehicleInstance;
  }
}

@Controller('map-vehicle-instances')
@UseFilters(AllExceptionsFilter)
export class MapVehicleInstancesController extends AbstractServiceController<
  MapVehicleInstance,
  MapVehicleInstanceDto
> {
  constructor(
    private readonly vehicleInstancesService: MapVehicleInstancesService,
    private readonly vehicleInstanceMapper: MapVehicleInstanceMapper
  ) {
    super(vehicleInstancesService, vehicleInstanceMapper);
  }

  @Get('by-player-and-map/:playerId/:mapId')
  @UseGuards(LoggedIn)
  async findAllByPlayerAndMap(
    pagination: any,
    playerId: string,
    mapId: string
  ): Promise<PageDto<MapVehicleInstanceDto>> {
    return this.vehicleInstancesService.findAllByPlayerAndMap(pagination, playerId, mapId).then(this.makeHandler());
  }

  @Get('by-vehicle/:mapVehicleId')
  @UseGuards(LoggedIn)
  async findAllByVehicle(pagination: any, mapVehicleId: string): Promise<PageDto<MapVehicleInstanceDto>> {
    return this.vehicleInstancesService.findAllByVehicle(pagination, mapVehicleId).then(this.makeHandler());
  }
}

@Module({
  imports: [MapPlacesModule, MapVehiclesModule, MapTemplateModule, TypeOrmModule.forFeature([MapVehicleInstance])],
  controllers: [MapVehicleInstancesController],
  providers: [MapVehicleInstancesService, MapVehicleInstanceMapper, MapVehicleInstanceRepository],
  exports: [MapVehicleInstancesService, MapVehicleInstanceMapper],
})
export class MapVehicleInstancesModule {}
