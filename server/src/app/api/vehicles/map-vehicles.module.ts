import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Injectable,
  Module,
  Param,
  Query,
  UseGuards
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { omit } from 'lodash';
import { FindOptionsUtils } from 'typeorm';

import { LoggedIn } from '../../../authentication/authentication.guard';
import { PageDto } from '../../../models/page.model';
import { PageRequestDto } from '../../../models/pagination.model';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { MapTemplateModule, MapTemplateService } from '../maps/map-template.module';

import { MapVehicle, MapVehicleDto } from './map-vehicle.entity';
import { VehicleModule, VehiclesService } from './vehicle.module';

@Injectable()
export class MapVehicleRepository extends RepositoryAccessor<MapVehicle> {
  constructor(@InjectRepository(MapVehicle) injectedRepo) {
    super(injectedRepo, ['vehicle', 'map']);
  }
}

@Injectable()
export class MapVehiclesService extends AbstractService<MapVehicle> {
  constructor(repo: MapVehicleRepository) {
    super(repo);
  }

  findAllByMap(pagination: PageRequestDto, mapId: string): Promise<PageDto<MapVehicle>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skippedItems = (page - 1) * limit;

    let query = this.repository.createQueryBuilder('map_vehicle');
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
    query = query.where('map_vehicle.map.id = :mapId', { mapId });

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
export class MapVehicleMapper extends AbstractDtoMapper<MapVehicle, MapVehicleDto> {
  constructor(
    private readonly mapTemplateService: MapTemplateService,
    private readonly vehicleService: VehiclesService
  ) {
    super();
  }

  async toDto(domain: MapVehicle): Promise<MapVehicleDto> {
    if (!domain) {
      return null;
    }

    const dto: any = {
      id: domain._id.toString(),
      vehicleId: domain.vehicle?._id.toString(),
      mapId: domain.map?._id.toString()
    };

    return dto;
  }

  async toDomain(dto: MapVehicleDto, domain?: MapVehicle): Promise<MapVehicle> {
    if (!dto) {
      return domain as any as MapVehicle;
    }

    if (!domain) {
      domain = new MapVehicle();
    }

    const vehicleId = dto.vehicleId ?? domain.vehicle?._id;
    const mapId = dto.mapId ?? domain.map?._id;

    const fixedDto = omit(dto, ['vehicleId', 'mapId']);

    return {
      ...domain,
      ...fixedDto,
      vehicle: vehicleId ? await this.vehicleService.findOne(vehicleId.toString()) : null,
      map: mapId ? await this.mapTemplateService.findOne(mapId.toString()) : null
    } as MapVehicle;
  }
}

@Controller('map-vehicles')
@UseGuards(AllExceptionsFilter)
export class MapVehiclesController extends AbstractServiceController<MapVehicle, MapVehicleDto> {
  constructor(service: MapVehiclesService, mapper: MapVehicleMapper) {
    super(service, mapper);
  }

  @Get('by-map/:mapId')
  @UseGuards(LoggedIn)
  async findAllByMap(
    @Query() pagination: PageRequestDto,
    @Param('mapId') mapId: string
  ): Promise<PageDto<MapVehicleDto>> {
    return (this.service as MapVehiclesService).findAllByMap(pagination, mapId).then(async page => {
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
  imports: [VehicleModule, MapTemplateModule, TypeOrmModule.forFeature([MapVehicle])],
  controllers: [MapVehiclesController],
  providers: [MapVehicleRepository, MapVehiclesService, MapVehicleMapper],
  exports: [MapVehiclesService, MapVehicleMapper]
})
export class MapVehiclesModule {}
