import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { omit } from 'lodash';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { PlaceModule, PlacesService } from '../places/place.module';
import { PlayersModule, PlayersService } from '../players/player.module';
import { VehicleInstanceJob, VehicleInstanceJobDto } from './vehicle-instance-job.entity';
import { VehicleInstanceMapper, VehicleInstancesModule, VehicleInstancesService } from './vehicle-instance.module';

@Injectable()
export class VehicleInstanceJobRepository extends RepositoryAccessor<VehicleInstanceJob> {
  constructor(@InjectRepository(VehicleInstanceJob) injectedRepo) {
    super(injectedRepo, ['vehicleInstance', 'player']);
  }
}

@Injectable()
export class VehicleInstanceJobService extends AbstractService<VehicleInstanceJob> {
  constructor(private readonly repo: VehicleInstanceJobRepository) {
    super(repo)
  }
}

@Injectable()
export class VehicleInstanceJobMapper extends AbstractDtoMapper<VehicleInstanceJob, VehicleInstanceJobDto> {
  constructor(
    private readonly placesService: PlacesService,
    private readonly vehicleInstancesService: VehicleInstancesService,
    private readonly playersService: PlayersService) {
    super();
  }

  async toDto(domain: VehicleInstanceJob): Promise<VehicleInstanceJobDto> {
    if (!domain) {
      return null;
    }

    const dto: VehicleInstanceJobDto = {
      id: domain.id,
      type: domain.type,
      name: domain.name,
      description: domain.description,
      load: domain.load,
      payType: domain.payType,
      pay: domain.pay,
      vehicleInstanceId: domain.vehicleInstance?.id,
      playerId: domain.player?.id,
      startId: domain.start?.id,
      endId: domain.end?.id,
      startTime: domain.startTime?.toISOString(),
      content: domain.content
    };

    return dto;
  }

  async toDomain(dto: VehicleInstanceJobDto, domain?: Partial<VehicleInstanceJob> | VehicleInstanceJob): Promise<VehicleInstanceJob> {
    if (!dto) {
      return domain as any as VehicleInstanceJob;
    }

    if (!domain) {
      domain = {};
    }

    const vehicleInstanceId = dto.vehicleInstanceId ?? domain.vehicleInstance?.id;
    const playerId = dto.playerId ?? domain.player?.id;
    const startId = dto.startId ?? domain.start?.id;
    const endId = dto.endId ?? domain.end?.id;
    const startTime = dto.startTime ? new Date(dto.startTime) : domain.startTime;

    const fixedDto = omit(dto, ['vehicleInstanceId', 'playerId', 'startId', 'endId', 'startTime']);

    return {
      ...domain,
      ...fixedDto,
      vehicleInstance: await this.vehicleInstancesService.findOne(vehicleInstanceId),
      player: await this.playersService.findOne(playerId),
      start: await this.placesService.findOne(startId),
      end: await this.placesService.findOne(endId),
      startTime,
    } as any as VehicleInstanceJob;
  }
}

@Controller('vehicle-instance-jobs')
@UseFilters(AllExceptionsFilter)
export class VehicleInstanceJobsController extends AbstractServiceController<VehicleInstanceJob, VehicleInstanceJobDto> {
  constructor(
    private readonly vehicleInstanceJobsService: VehicleInstanceJobService,
    private readonly vehicleInstanceJobsMapper: VehicleInstanceJobMapper) {
    super(vehicleInstanceJobsService, vehicleInstanceJobsMapper)
  }
}

@Module({
  imports: [PlaceModule, VehicleInstancesModule, PlayersModule, TypeOrmModule.forFeature([VehicleInstanceJob])],
  controllers: [VehicleInstanceJobsController],
  providers: [VehicleInstanceJobService, VehicleInstanceJobMapper, VehicleInstanceJobRepository],
  exports: [VehicleInstanceJobService, VehicleInstanceJobMapper]
})
export class VehicleInstanceJobsModule { }
