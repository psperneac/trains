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
import { MapPlacesModule, MapPlacesService } from '../places/map-place.module';

import { MapVehicleInstanceJob, MapVehicleInstanceJobDto } from './map-vehicle-instance-job.entity';
import { MapVehicleInstanceDto } from './map-vehicle-instance.entity';
import { MapVehicleInstancesModule, MapVehicleInstancesService } from './map-vehicle-instance.module';

@Injectable()
export class MapVehicleInstanceJobRepository extends RepositoryAccessor<MapVehicleInstanceJob> {
  constructor(@InjectRepository(MapVehicleInstanceJob) injectedRepo) {
    super(injectedRepo, ['mapVehicleInstance', 'player', 'map']);
  }
}

@Injectable()
export class MapVehicleInstanceJobService extends AbstractService<MapVehicleInstanceJob> {
  constructor(private readonly repo: MapVehicleInstanceJobRepository) {
    super(repo);
  }

  findAllByPlayerAndMap(pagination: any, playerId: string, mapId: string) {
    return this.findAllWithQuery(
      pagination,
      'map_vehicle_instance_jobs.map.id = :mapId and map_vehicle_instance_jobs.player.id = :playerId',
      { mapId, playerId }
    );
  }

  findAllByVehicle(pagination: any, vehicleId: string) {
    return this.findAllWithQuery(pagination, 'map_vehicle_instance_jobs.mapVehicleInstance.id = :vehicleId', {
      vehicleId
    });
  }
}

@Injectable()
export class MapVehicleInstanceJobMapper extends AbstractDtoMapper<MapVehicleInstanceJob, MapVehicleInstanceJobDto> {
  constructor(
    private readonly mapPlacesService: MapPlacesService,
    private readonly vehicleInstancesService: MapVehicleInstancesService,
    private readonly mapService: MapTemplateService
  ) {
    super();
  }

  async toDto(domain: MapVehicleInstanceJob): Promise<MapVehicleInstanceJobDto> {
    if (!domain) {
      return null;
    }

    const dto: MapVehicleInstanceJobDto = {
      id: domain._id.toString(),
      type: domain.type,
      name: domain.name,
      description: domain.description,
      load: domain.load,
      payType: domain.payType,
      pay: domain.pay,
      mapVehicleInstanceId: domain.mapVehicleInstance?._id.toString(),
      playerId: domain.playerId,
      mapId: domain.map?._id.toString(),
      startId: domain.start?._id.toString(),
      endId: domain.end?._id.toString(),
      startTime: domain.startTime?.toISOString(),
      content: domain.content
    };

    return dto;
  }

  async toDomain(
    dto: MapVehicleInstanceJobDto,
    domain?: Partial<MapVehicleInstanceJob> | MapVehicleInstanceJob
  ): Promise<MapVehicleInstanceJob> {
    if (!dto) {
      return domain as any as MapVehicleInstanceJob;
    }

    if (!domain) {
      domain = {};
    }

    const vehicleInstanceId = dto.mapVehicleInstanceId ?? domain.mapVehicleInstance?._id.toString();
    const mapId = dto.mapId ?? domain.map?._id.toString();
    const startId = dto.startId ?? domain.start?._id.toString();
    const endId = dto.endId ?? domain.end?._id.toString();
    const startTime = dto.startTime ? new Date(dto.startTime) : domain.startTime;

    const fixedDto = omit(dto, ['vehicleInstanceId', 'mapId', 'startId', 'endId', 'startTime']);

    return {
      ...domain,
      ...fixedDto,
      vehicleInstance: await this.vehicleInstancesService.findOne(vehicleInstanceId),
      map: await this.mapService.findOne(mapId),
      start: await this.mapPlacesService.findOne(startId),
      end: await this.mapPlacesService.findOne(endId),
      startTime
    } as any as MapVehicleInstanceJob;
  }
}

@Controller('map-vehicle-instance-jobs')
@UseFilters(AllExceptionsFilter)
export class MapVehicleInstanceJobsController extends AbstractServiceController<
  MapVehicleInstanceJob,
  MapVehicleInstanceJobDto
> {
  constructor(
    private readonly mapVehicleInstanceJobsService: MapVehicleInstanceJobService,
    private readonly mapVehicleInstanceJobsMapper: MapVehicleInstanceJobMapper
  ) {
    super(mapVehicleInstanceJobsService, mapVehicleInstanceJobsMapper);
  }

  @Get('by-player-and-map/:playerId/:mapId')
  @UseGuards(LoggedIn)
  async findAllByPlayerAndMap(
    pagination: any,
    playerId: string,
    mapId: string
  ): Promise<PageDto<MapVehicleInstanceDto>> {
    return this.mapVehicleInstanceJobsService
      .findAllByPlayerAndMap(pagination, playerId, mapId)
      .then(this.makeHandler());
  }

  @Get('by-vehicle/:mapVehicleId')
  @UseGuards(LoggedIn)
  async findAllByVehicle(pagination: any, mapVehicleId: string): Promise<PageDto<MapVehicleInstanceDto>> {
    return this.mapVehicleInstanceJobsService.findAllByVehicle(pagination, mapVehicleId).then(this.makeHandler());
  }
}

@Module({
  imports: [
    MapPlacesModule,
    MapVehicleInstancesModule,
    MapTemplateModule,
    TypeOrmModule.forFeature([MapVehicleInstanceJob])
  ],
  controllers: [MapVehicleInstanceJobsController],
  providers: [MapVehicleInstanceJobService, MapVehicleInstanceJobMapper, MapVehicleInstanceJobRepository],
  exports: [MapVehicleInstanceJobService, MapVehicleInstanceJobMapper]
})
export class MapVehicleInstanceJobsModule {}
