import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { omit } from 'lodash';

import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { MapTemplateModule, MapTemplateService } from '../maps/map-template.module';

import { MapPlaceInstanceJob, MapPlaceInstanceJobDto } from './map-place-instance-job.entity';
import { MapPlaceInstancesModule, MapPlaceInstancesService } from './map-place-instance.module';
import { MapPlacesModule, MapPlacesService } from './map-place.module';

@Injectable()
export class MapPlaceInstanceJobRepository extends RepositoryAccessor<MapPlaceInstanceJob> {
  constructor(@InjectRepository(MapPlaceInstanceJob) injectedRepo) {
    super(injectedRepo, ['mapPlaceInstance', 'player', 'map', 'start', 'end']);
  }
}

@Injectable()
export class MapPlaceInstanceJobsService extends AbstractService<MapPlaceInstanceJob> {
  constructor(repo: MapPlaceInstanceJobRepository) {
    super(repo);
  }
}

@Injectable()
export class MapPlaceInstanceJobMapper extends AbstractDtoMapper<MapPlaceInstanceJob, MapPlaceInstanceJobDto> {
  constructor(
    private readonly placesService: MapPlacesService,
    private readonly mapService: MapTemplateService,
    private readonly mapPlaceInstancesService: MapPlaceInstancesService
  ) {
    super();
  }

  async toDto(domain: MapPlaceInstanceJob): Promise<MapPlaceInstanceJobDto> {
    if (!domain) {
      return null;
    }

    const dto: MapPlaceInstanceJobDto = {
      id: domain._id.toString(),
      type: domain.type,
      name: domain.name,
      description: domain.description,
      load: domain.load,
      payType: domain.payType,
      pay: domain.pay,
      startTime: domain.startTime?.toISOString(),
      startId: domain.start?._id.toString(),
      endId: domain.end?._id.toString(),
      mapPlaceInstanceId: domain.mapPlaceInstance?._id.toString(),
      playerId: domain.playerId,
      mapId: domain.map?._id.toString(),
      content: domain.content
    };

    return dto;
  }

  async toDomain(
    dto: MapPlaceInstanceJobDto,
    domain?: Partial<MapPlaceInstanceJob> | MapPlaceInstanceJob
  ): Promise<MapPlaceInstanceJob> {
    if (!dto) {
      return domain as any as MapPlaceInstanceJob;
    }

    if (!domain) {
      domain = {};
    }

    const startId = dto.startId ?? domain.start?._id.toString();
    const endId = dto.endId ?? domain.end?._id.toString();
    const mapPlaceInstanceId = dto.mapPlaceInstanceId ?? domain.mapPlaceInstance?._id.toString();
    const mapId = dto.mapId ?? domain.map?._id.toString();
    const startTime = dto.startTime ? new Date(dto.startTime) : domain.startTime;

    const fixedDto = omit({ ...dto }, ['startId', 'endId', 'mapPlaceInstanceId', 'mapId', 'startTime']);

    return {
      ...domain,
      ...fixedDto,
      start: await this.placesService.findOne(startId),
      end: await this.placesService.findOne(endId),
      startTime,
      mapPlaceInstance: await this.mapPlaceInstancesService.findOne(mapPlaceInstanceId),
      map: await this.mapService.findOne(mapId)
    } as MapPlaceInstanceJob;
  }
}

@Controller('map-place-instance-jobs')
@UseFilters(AllExceptionsFilter)
export class MapPlaceInstanceJobsController extends AbstractServiceController<
  MapPlaceInstanceJob,
  MapPlaceInstanceJobDto
> {
  constructor(service: MapPlaceInstanceJobsService, mapper: MapPlaceInstanceJobMapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [
    MapPlacesModule,
    MapPlaceInstancesModule,
    MapTemplateModule,
    TypeOrmModule.forFeature([MapPlaceInstanceJob])
  ],
  controllers: [MapPlaceInstanceJobsController],
  providers: [MapPlaceInstanceJobsService, MapPlaceInstanceJobMapper, MapPlaceInstanceJobRepository],
  exports: [MapPlaceInstanceJobsService, MapPlaceInstanceJobMapper]
})
export class MapPlaceInstanceJobsModule {}
