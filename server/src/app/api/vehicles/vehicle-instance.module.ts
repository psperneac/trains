import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { omit } from 'lodash';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { MapTemplateModule, MapTemplateService } from '../maps/map-template.module';
import { PlaceModule, PlacesService } from '../places/place.module';
import { PlayersModule, PlayersService } from '../players/player.module';
import { VehicleInstance, VehicleInstanceDto } from './vehicle-instance.entity';
import { VehicleModule, VehiclesService } from './vehicle.module';

@Injectable()
export class VehicleInstanceRepository extends RepositoryAccessor<VehicleInstance> {
  constructor(@InjectRepository(VehicleInstance) injectRepo) {
    super(injectRepo, ['vehicle', 'player']);
  }
}

@Injectable()
export class VehicleInstancesService extends AbstractService<VehicleInstance> {
  constructor(repo: VehicleInstanceRepository) {
    super(repo);
  }
}

@Injectable()
export class VehicleInstanceMapper extends AbstractDtoMapper<VehicleInstance, VehicleInstanceDto> {
  constructor(
    private readonly placesService: PlacesService,
    private readonly vehiclesService: VehiclesService,
    private readonly playersService: PlayersService,
    private readonly mapService: MapTemplateService,
  ) {
    super();
  }

  async toDto(domain: VehicleInstance): Promise<VehicleInstanceDto> {
    if (!domain) {
      return null;
    }

    const dto: VehicleInstanceDto = {
      id: domain.id,
      vehicleId: domain.vehicle?.id,
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

  async toDomain(dto: VehicleInstanceDto, domain?: Partial<VehicleInstance> | VehicleInstance): Promise<VehicleInstance> {
    if (!dto) {
      return domain as any as VehicleInstance;
    }

    if (!domain) {
      domain = {};
    }

    const vehicleId = dto.vehicleId ?? domain.vehicle?.id;
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
      vehicle: await this.vehiclesService.findOne(vehicleId),
      player: await this.playersService.findOne(playerId),
      map: await this.mapService.findOne(mapId),
      start: await this.placesService.findOne(startId),
      end: await this.placesService.findOne(endId),
      startTime,
      endTime,
    } as any as VehicleInstance;
  }
}

@Controller('vehicle-instances')
@UseFilters(AllExceptionsFilter)
export class VehicleInstancesController extends AbstractServiceController<VehicleInstance, VehicleInstanceDto> {
  constructor(
    private readonly vehicleInstancesService: VehicleInstancesService,
    private readonly vehicleInstanceMapper: VehicleInstanceMapper) {
    super(vehicleInstancesService, vehicleInstanceMapper);
  }
}

@Module({
  imports: [PlaceModule, VehicleModule, PlayersModule, MapTemplateModule, TypeOrmModule.forFeature([VehicleInstance])],
  controllers: [VehicleInstancesController],
  providers: [VehicleInstancesService, VehicleInstanceMapper, VehicleInstanceRepository],
  exports: [VehicleInstancesService, VehicleInstanceMapper]
})
export class VehicleInstancesModule { }
