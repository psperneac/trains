import {
  Controller,
  forwardRef,
  Get, HttpException, HttpStatus,
  Inject,
  Injectable,
  Module,
  Param,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { FindOptionsUtils } from 'typeorm';

import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { PlaceModule, PlacesService } from '../places/place.module';
import { MapPlace, MapPlaceDto } from './map-place.entity';
import { MapTemplateModule, MapTemplateService } from './map-template.module';
import { PageRequestDto } from '../../../models/pagination.model';
import { PageDto } from '../../../models/page.model';
import { LoggedIn } from '../../../authentication/authentication.guard';

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

  findAllByMap(pagination: PageRequestDto, mapId: string): Promise<PageDto<MapPlace>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skippedItems = (page - 1) * limit;

    let query = this.repository.createQueryBuilder('map_place')
      // .innerJoin('map_place.map', 'map').innerJoin('map_place.map', 'map');
    if (this.relationships) {
      // clone relationships because the method empties it
      FindOptionsUtils.applyRelationsRecursively(
        query,
        [...this.relationships],
        query.alias,
        this.repository.metadata,
        ''
      );
    }
    if (!pagination.unpaged) {
      query = query.offset(skippedItems).limit(limit);
    }
    if (pagination.sortColumn) {
      query = query.orderBy(pagination.sortColumn, pagination.sortDescending ? 'DESC' : 'ASC');
    }
    query = query.where('map_place.map.id = :mapId', { mapId });

    return Promise.all([query.getMany(), this.repository.count()]).then(([data, count]) => {
      return {
        data,
        page: pagination.unpaged ? page : 1,
        limit: pagination.unpaged ? count : limit,
        totalCount: count
      };
    });
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

  @Get('by-map/:mapId')
  @UseGuards(LoggedIn)
  async findAllByMap(@Query() pagination: PageRequestDto, @Param('mapId') mapId: string): Promise<PageDto<MapPlaceDto>> {
    return (this.service as MapPlaceService).findAllByMap(pagination, mapId).then(async page => {
      return Promise.all(page?.data?.map(item => this.mapper.toDto(item)))
        .then(mappedData => ({
          ...page,
          data: mappedData
        }))
        .catch(e => {
          if (e instanceof HttpException) {
            throw e;
          } else if (e instanceof Error) {
            throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
          } else {
            throw new HttpException('Entities cannot be located', HttpStatus.INTERNAL_SERVER_ERROR);
          }
        });
    });
  }
}

@Module({
  imports: [PlaceModule, MapTemplateModule, TypeOrmModule.forFeature([MapPlace])],
  controllers: [MapPlaceController],
  providers: [MapPlaceService, MapPlaceMapper, MapPlaceRepository],
  exports: [MapPlaceService, MapPlaceMapper]
})
export class MapPlaceModule { }
