import { Controller, forwardRef, Inject, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { PlaceModule, PlacesService } from '../places/place.module';
import { MapPlace, MapPlaceDto } from './map-place.entity';
import { MapTemplateModule, MapTemplateService } from './map-template.module';

@Injectable()
export class MapPlaceRepository extends RepositoryAccessor<MapPlace> {
  constructor(@InjectRepository(MapPlace) injectedRepo) {
    super(injectedRepo, ['place', 'map']);
  }
}

@Injectable()
export class MapPlaceService extends AbstractService<MapPlace> {
  constructor(repo: MapPlaceRepository) {
    super(repo);
  }
}

@Injectable()
export class MapPlaceMapper extends AbstractDtoMapper<MapPlace, MapPlaceDto> {
  constructor(
    private readonly mapTemplateService: MapTemplateService,
    private readonly placeService: PlacesService) {
    super();
  }

  async toDto(domain: MapPlace): Promise<MapPlaceDto> {
    if (!domain) {
      return null;
    }

    const dto: any = {
      id: domain.id,
      placeId: domain.place?.id,
      mapId: domain.map?.id
    };

    return dto;
  }

  async toDomain(dto: any, domain?: Partial<MapPlace> | MapPlace): Promise<MapPlace> {
    if (!dto) {
      return domain as any as MapPlace;
    }

    if (!domain) {
      domain = {};
    }

    const placeId = dto.placeId ?? domain.place?.id;
    const mapId = dto.mapId ?? domain.map?.id;

    return {
      ...domain,
      place: await this.placeService.findOne(placeId),
      map: await this.mapTemplateService.findOne(mapId)
    } as MapPlace;
  }
}

@Controller('map-places')
@UseFilters(AllExceptionsFilter)
export class MapPlaceController extends AbstractServiceController<MapPlace, MapPlaceDto> {
  constructor(service: MapPlaceService, mapper: MapPlaceMapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [PlaceModule, MapTemplateModule, TypeOrmModule.forFeature([MapPlace])],
  controllers: [MapPlaceController],
  providers: [MapPlaceService, MapPlaceMapper, MapPlaceRepository],
  exports: [MapPlaceService, MapPlaceMapper]
})
export class MapPlaceModule { }
