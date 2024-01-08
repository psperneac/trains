import {
  Controller,
  Get,
  HttpException, HttpStatus,
  Injectable,
  Module,
  Param,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { PlaceConnectionService, PlaceConnectionsModule } from '../places/place-connection.module';
import { MapPlaceConnection, MapPlaceConnectionDto } from './map-place-connection.entity';
import { MapTemplateModule, MapTemplateService } from './map-template.module';
import { PageRequestDto } from '../../../models/pagination.model';
import { PageDto } from '../../../models/page.model';
import { FindOptionsUtils } from 'typeorm';
import { LoggedIn } from '../../../authentication/authentication.guard';
import { MapPlaceService } from './map-place.module';

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

  findAllByMap(pagination: PageRequestDto, mapId: string): Promise<PageDto<MapPlaceConnection>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skippedItems = (page - 1) * limit;

    let query = this.repository.createQueryBuilder('map_place_connection')
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
    query = query.where('map_place_connection.map.id = :mapId', { mapId });

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

  @Get('by-map/:mapId')
  @UseGuards(LoggedIn)
  async findAllByMap(@Query() pagination: PageRequestDto, @Param('mapId') mapId: string): Promise<PageDto<MapPlaceConnectionDto>> {
    return (this.service as MapPlaceConnectionService).findAllByMap(pagination, mapId).then(async page => {
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
  imports: [PlaceConnectionsModule, MapTemplateModule, TypeOrmModule.forFeature([MapPlaceConnection])],
  controllers: [MapPlaceConnectionController],
  providers: [MapPlaceConnectionService, MapPlaceConnectionMapper, MapPlaceConnectionRepository],
  exports: [MapPlaceConnectionService, MapPlaceConnectionMapper]
})
export class MapPlaceConnectionModule { }