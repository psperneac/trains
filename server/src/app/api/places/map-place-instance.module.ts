import { Controller, Get, Injectable, Module, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { omit } from 'lodash';

import { LoggedIn } from '../../../authentication/authentication.guard';
import { PageDto } from '../../../models/page.model';
import { PageRequestDto } from '../../../models/pagination.model';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';

import { MapPlaceInstance, MapPlaceInstanceDto } from './map-place-instance.entity';
import { MapPlacesModule, MapPlacesService } from './map-place.module';

@Injectable()
export class MapPlaceInstanceRepository extends RepositoryAccessor<MapPlaceInstance> {
  constructor(@InjectRepository(MapPlaceInstance) injectedRepo) {
    super(injectedRepo, ['mapPlace', 'map', 'jobs', 'jobOffers']);
  }
}

@Injectable()
export class MapPlaceInstancesService extends AbstractService<MapPlaceInstance> {
  constructor(repo: MapPlaceInstanceRepository) {
    super(repo);
  }

  findAllByPlayerAndMap(
    pagination: PageRequestDto,
    playerId: string,
    mapId: string
  ): Promise<PageDto<MapPlaceInstance>> {
    return this.findAllWithQuery(
      pagination,
      'map_place_instances.map.id = :mapId and map_place_instances.player.id = :playerId',
      { mapId, playerId }
    ) as Promise<PageDto<MapPlaceInstance>>;
  }
}

@Injectable()
export class MapPlaceInstanceMapper extends AbstractDtoMapper<MapPlaceInstance, MapPlaceInstanceDto> {
  constructor(private readonly mapPlacesService: MapPlacesService) {
    super();
  }

  async toDto(domain: MapPlaceInstance): Promise<MapPlaceInstanceDto> {
    if (!domain) {
      return null;
    }

    const dto: MapPlaceInstanceDto = {
      id: domain._id.toString(),
      mapPlaceId: domain.mapPlace?._id.toString(),
      playerId: domain.playerId,
      jobs: domain.jobs?.map(j => j._id.toString()),
      jobOffers: domain.jobOffers?.map(j => j._id.toString()),
      content: domain.content
    };

    return dto;
  }

  async toDomain(
    dto: MapPlaceInstanceDto,
    domain?: Partial<MapPlaceInstance> | MapPlaceInstance
  ): Promise<MapPlaceInstance> {
    if (!dto) {
      return domain as any as MapPlaceInstance;
    }

    if (!domain) {
      domain = {};
    }

    const mapPlaceId = dto.mapPlaceId ?? domain.mapPlace?._id.toString();

    const fixedDto = omit(dto, ['mapPlaceId']);

    return {
      ...domain,
      ...fixedDto,
      mapPlace: await this.mapPlacesService.findOne(mapPlaceId)
    } as any as MapPlaceInstance;
  }
}

@Controller('map-place-instances')
@UseFilters(AllExceptionsFilter)
export class MapPlaceInstanceController extends AbstractServiceController<MapPlaceInstance, MapPlaceInstanceDto> {
  constructor(service: MapPlaceInstancesService, mapper: MapPlaceInstanceMapper) {
    super(service, mapper);
  }

  @Get('by-player-and-map/:playerId/:mapId')
  @UseGuards(LoggedIn)
  async findAllByPlayerAndMap(
    pagination: PageRequestDto,
    playerId: string,
    mapId: string
  ): Promise<PageDto<MapPlaceInstanceDto>> {
    return (this.service as MapPlaceInstancesService)
      .findAllByPlayerAndMap(pagination, playerId, mapId)
      .then(this.makeHandler());
  }
}

@Module({
  imports: [MapPlacesModule, TypeOrmModule.forFeature([MapPlaceInstance])],
  controllers: [MapPlaceInstanceController],
  providers: [MapPlaceInstancesService, MapPlaceInstanceMapper, MapPlaceInstanceRepository],
  exports: [MapPlaceInstancesService, MapPlaceInstanceMapper]
})
export class MapPlaceInstancesModule {}
