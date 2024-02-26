import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { omit } from 'lodash';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { MapPlacesModule, MapPlacesService } from '../maps/map-places.module';
import { MapTemplateModule, MapTemplateService } from '../maps/map-template.module';
import { PlayersModule, PlayersService } from '../players/player.module';
import { MapPlaceInstanceJob, MapPlaceInstanceJobDto } from './map-place-instance-job.entity';
import { MapPlaceInstancesModule, MapPlaceInstancesService } from './map-place-instance.module';

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
  constructor(private readonly placesService: MapPlacesService,
              private readonly playersService: PlayersService,
              private readonly mapService: MapTemplateService,
              private readonly mapPlaceInstancesService: MapPlaceInstancesService) {
    super();
  }

  async toDto(domain: MapPlaceInstanceJob): Promise<MapPlaceInstanceJobDto> {
    if (!domain) {
      return null;
    }

    const dto: MapPlaceInstanceJobDto = {
      id: domain.id,
      type: domain.type,
      name: domain.name,
      description: domain.description,
      load: domain.load,
      payType: domain.payType,
      pay: domain.pay,
      startTime: domain.startTime?.toISOString(),
      startId: domain.start?.id,
      endId: domain.end?.id,
      mapPlaceInstanceId: domain.mapPlaceInstance?.id,
      playerId: domain.player?.id,
      mapId: domain.map?.id,
      content: domain.content
    };

    return dto;
  }

  async toDomain(dto: MapPlaceInstanceJobDto, domain?: Partial<MapPlaceInstanceJob> | MapPlaceInstanceJob): Promise<MapPlaceInstanceJob> {
    if (!dto) {
      return domain as any as MapPlaceInstanceJob;
    }

    if (!domain) {
      domain = {};
    }

    const startId = dto.startId ?? domain.start?.id;
    const endId = dto.endId ?? domain.end?.id;
    const mapPlaceInstanceId = dto.mapPlaceInstanceId ?? domain.mapPlaceInstance?.id;
    const playerId = dto.playerId ?? domain.player?.id;
    const mapId = dto.mapId ?? domain.map?.id;
    const startTime = dto.startTime ? new Date(dto.startTime) : domain.startTime;

    const fixedDto = omit(
      { ...dto },
      ['startId', 'endId', 'mapPlaceInstanceId', 'playerId', 'mapId', 'startTime']);

    return {
      ...domain,
      ...fixedDto,
      start: await this.placesService.findOne(startId),
      end: await this.placesService.findOne(endId),
      startTime,
      mapPlaceInstance: await this.mapPlaceInstancesService.findOne(mapPlaceInstanceId),
      player: await this.playersService.findOne(playerId),
      map: await this.mapService.findOne(mapId),
    } as MapPlaceInstanceJob;
  }
}

@Controller('map-place-instance-jobs')
@UseFilters(AllExceptionsFilter)
export class MapPlaceInstanceJobsController extends AbstractServiceController<MapPlaceInstanceJob, MapPlaceInstanceJobDto> {
  constructor(service: MapPlaceInstanceJobsService, mapper: MapPlaceInstanceJobMapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [MapPlacesModule, PlayersModule, MapPlaceInstancesModule, MapTemplateModule, TypeOrmModule.forFeature([MapPlaceInstanceJob])],
  controllers: [MapPlaceInstanceJobsController],
  providers: [MapPlaceInstanceJobsService, MapPlaceInstanceJobMapper, MapPlaceInstanceJobRepository],
  exports: [MapPlaceInstanceJobsService, MapPlaceInstanceJobMapper]
})
export class MapPlaceInstanceJobsModule {}
