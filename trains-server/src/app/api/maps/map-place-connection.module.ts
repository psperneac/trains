import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { PlaceConnectionService, PlaceConnectionsModule } from '../places/place-connection.module';
import { MapPlaceConnection, MapPlaceConnectionDto } from './map-place-connection.entity';
import { MapTemplateModule, MapTemplateService } from './map-template.module';

@Injectable()
export class MapPlaceConnectionRepository extends RepositoryAccessor<MapPlaceConnection>{
  constructor(@InjectRepository(MapPlaceConnection) injectedRepo) {
    super(injectedRepo, ['placeConnection', 'map']);
  }
}

@Injectable()
export class MapPlaceConnectionService extends AbstractService<MapPlaceConnection> {
  constructor(private readonly repo: MapPlaceConnectionRepository) {
    super(repo);
  }
}

@Injectable()
export class MapPlaceConnectionMapper extends AbstractDtoMapper<MapPlaceConnection, MapPlaceConnectionDto> {
  constructor(private readonly placeConnectionService: PlaceConnectionService, private readonly mapService: MapTemplateService) {
    super();
  }

  async toDto(domain: MapPlaceConnection): Promise<any> {
    if (!domain) {
      return null;
    }

    const dto: any = {
      id: domain.id,
      placeConnectionId: domain.placeConnection?.id,
      mapId: domain.map?.id
    };

    return dto;
  }

  async toDomain(dto: any, domain?: Partial<MapPlaceConnection> | MapPlaceConnection): Promise<MapPlaceConnection> {
    if (!dto) {
      return domain as any as MapPlaceConnection;
    }

    if (!domain) {
      domain = {};
    }

    const placeConnectionId = dto.placeConnectionId ?? domain.placeConnection?.id;
    const mapId = dto.mapId ?? domain.map?.id;

    return {
      ...domain,
      placeConnection: await this.placeConnectionService.findOne(placeConnectionId),
      map: await this.mapService.findOne(mapId),
    } as MapPlaceConnection;
  }
}

@Controller('map-place-connections')
@UseFilters(AllExceptionsFilter)
export class MapPlaceConnectionController extends AbstractServiceController<MapPlaceConnection, MapPlaceConnectionDto> {
  constructor(service: MapPlaceConnectionService, mapper: MapPlaceConnectionMapper) {
    super(service, mapper)
  }
}

@Module({
  imports: [PlaceConnectionsModule, MapTemplateModule, TypeOrmModule.forFeature([MapPlaceConnection])],
  controllers: [MapPlaceConnectionController],
  providers: [MapPlaceConnectionService, MapPlaceConnectionMapper, MapPlaceConnectionRepository],
  exports: [MapPlaceConnectionService, MapPlaceConnectionMapper]
})
export class MapPlaceConnectionModule { }