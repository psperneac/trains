import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { omit } from 'lodash';

import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { MapTemplateModule, MapTemplateService } from '../maps/map-template.module';

import { MapPlaceConnectionInstance, MapPlaceConnectionInstanceDto } from './map-place-connection-instance.entity';
import { MapPlaceConnectionService, MapPlaceConnectionsModule } from './map-place-connections.module';

@Injectable()
export class MapPlaceConnectionInstanceRepository extends RepositoryAccessor<MapPlaceConnectionInstance> {
  constructor(@InjectRepository(MapPlaceConnectionInstance) injectedRepo) {
    super(injectedRepo, ['mapPlaceConnection', 'player']);
  }
}

@Injectable()
export class MapPlaceConnectionInstanceService extends AbstractService<MapPlaceConnectionInstance> {
  constructor(repo: MapPlaceConnectionInstanceRepository) {
    super(repo);
  }
}

@Injectable()
export class MapPlaceConnectionInstanceMapper extends AbstractDtoMapper<
  MapPlaceConnectionInstance,
  MapPlaceConnectionInstanceDto
> {
  constructor(
    private readonly mapPlaceConnectionService: MapPlaceConnectionService,
    private readonly mapService: MapTemplateService
  ) {
    super();
  }

  async toDto(domain: MapPlaceConnectionInstance): Promise<MapPlaceConnectionInstanceDto> {
    if (!domain) {
      return null;
    }

    const dto: MapPlaceConnectionInstanceDto = {
      id: domain._id.toString(),
      mapPlaceConnectionId: domain.mapPlaceConnection?._id.toString(),
      playerId: domain.playerId,
      mapId: domain.map?._id.toString(),
      content: domain.content
    };

    return dto;
  }

  async toDomain(
    dto: MapPlaceConnectionInstanceDto,
    domain?: Partial<MapPlaceConnectionInstance> | MapPlaceConnectionInstance
  ): Promise<MapPlaceConnectionInstance> {
    if (!dto) {
      return domain as any as MapPlaceConnectionInstance;
    }

    if (!domain) {
      domain = {};
    }

    const mapPlaceConnectionId = dto.mapPlaceConnectionId ?? domain.mapPlaceConnection?._id.toString();
    const mapId = dto.mapId ?? domain.map?._id.toString();

    const fixedDto = omit(dto, ['mapPlaceConnectionId', 'mapId']);

    return {
      ...domain,
      ...fixedDto,
      mapPlaceConnection: await this.mapPlaceConnectionService.findOne(mapPlaceConnectionId),
      map: await this.mapService.findOne(mapId),
      content: dto.content
    } as any as MapPlaceConnectionInstance;
  }
}

@Controller('map-place-connection-instances')
@UseFilters(AllExceptionsFilter)
export class MapPlaceConnectionInstanceController extends AbstractServiceController<
  MapPlaceConnectionInstance,
  MapPlaceConnectionInstanceDto
> {
  constructor(service: MapPlaceConnectionInstanceService, mapper: MapPlaceConnectionInstanceMapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [MapPlaceConnectionsModule, MapTemplateModule, TypeOrmModule.forFeature([MapPlaceConnectionInstance])],
  controllers: [MapPlaceConnectionInstanceController],
  providers: [
    MapPlaceConnectionInstanceService,
    MapPlaceConnectionInstanceMapper,
    MapPlaceConnectionInstanceRepository
  ],
  exports: [MapPlaceConnectionInstanceService, MapPlaceConnectionInstanceMapper]
})
export class PlaceConnectionInstancesModule {}
