import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { omit } from 'lodash';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { MapTemplateModule, MapTemplateService } from '../maps/map-template.module';
import { MapPlacesModule, MapPlacesService } from '../places/map-places.module';
import { PlayersModule, PlayersService } from '../players/player.module';
import { MapVehicleInstance, MapVehicleInstanceDto } from './map-vehicle-instance.entity';
import { MapVehiclesModule, MapVehiclesService } from './map-vehicles.module';
import { VehicleModule, VehiclesService } from './vehicle.module';

@Injectable()
export class MapVehicleInstanceRepository extends RepositoryAccessor<MapVehicleInstance> {
  constructor(@InjectRepository(MapVehicleInstance) injectRepo) {
    super(injectRepo, ['mapVehicle', 'player']);
  }
}

@Injectable()
export class MapVehicleInstancesService extends AbstractService<MapVehicleInstance> {
  constructor(repo: MapVehicleInstanceRepository) {
    super(repo);
  }
}

@Injectable()
export class MapVehicleInstanceMapper extends AbstractDtoMapper<MapVehicleInstance, MapVehicleInstanceDto> {
  constructor(
    private readonly mapPlacesService: MapPlacesService,
    private readonly mapVehiclesService: MapVehiclesService,
    private readonly playersService: PlayersService,
    private readonly mapService: MapTemplateService,
  ) {
    super();
  }

  async toDto(domain: MapVehicleInstance): Promise<MapVehicleInstanceDto> {
    if (!domain) {
      return null;
    }

    const dto: MapVehicleInstanceDto = {
      id: domain.id,
      mapVehicleId: domain.mapVehicle?.id,
      playerId: domain.player?.id,
      mapId: domain.map?.id,
      jobs: domain.jobs?.map(j => j.id),
      startId: domain.start?.id,
      endId: domain.end?.id,
      startTime: domain.startTime?.toISOString(),
      endTime: domain.endTime?.toISOString(),
      content: domain.content
    };

    return dto;
  }

  async toDomain(dto: MapVehicleInstanceDto, domain?: Partial<MapVehicleInstance> | MapVehicleInstance): Promise<MapVehicleInstance> {
    if (!dto) {
      return domain as any as MapVehicleInstance;
    }

    if (!domain) {
      domain = {};
    }

    const mapVehicleId = dto.mapVehicleId ?? domain.mapVehicle?.id;
    const playerId = dto.playerId ?? domain.player?.id;
    const mapId = dto.mapId ?? domain.map?.id;
    const startId = dto.startId ?? domain.start?.id;
    const endId = dto.endId ?? domain.end?.id;
    const startTime = dto.startTime ? new Date(dto.startTime) : domain.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : domain.endTime;

    const fixedDto = omit(dto, ['vehicleId', 'playerId', 'mapId', 'startId', 'endId', 'startTime', 'endTime']);

    return {
      ...domain,
      ...fixedDto,
      mapVehicle: await this.mapVehiclesService.findOne(mapVehicleId),
      player: await this.playersService.findOne(playerId),
      map: await this.mapService.findOne(mapId),
      start: await this.mapPlacesService.findOne(startId),
      end: await this.mapPlacesService.findOne(endId),
      startTime,
      endTime,
    } as any as MapVehicleInstance;
  }
}

@Controller('map-vehicle-instances')
@UseFilters(AllExceptionsFilter)
export class MapVehicleInstancesController extends AbstractServiceController<MapVehicleInstance, MapVehicleInstanceDto> {
  constructor(
    private readonly vehicleInstancesService: MapVehicleInstancesService,
    private readonly vehicleInstanceMapper: MapVehicleInstanceMapper) {
    super(vehicleInstancesService, vehicleInstanceMapper);
  }
}

@Module({
  imports: [MapPlacesModule, MapVehiclesModule, PlayersModule, MapTemplateModule, TypeOrmModule.forFeature([MapVehicleInstance])],
  controllers: [MapVehicleInstancesController],
  providers: [MapVehicleInstancesService, MapVehicleInstanceMapper, MapVehicleInstanceRepository],
  exports: [MapVehicleInstancesService, MapVehicleInstanceMapper]
})
export class MapVehicleInstancesModule { }
