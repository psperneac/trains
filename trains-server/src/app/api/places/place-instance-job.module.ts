import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { omit } from 'lodash';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { PlayersModule, PlayersService } from '../players/player.module';
import { PlaceInstanceJob, PlaceInstanceJobDto } from './place-instance-job.entity';
import { PlaceInstancesModule, PlaceInstancesService } from './place-instance.module';
import { PlaceModule, PlacesService } from './place.module';

@Injectable()
export class PlaceInstanceJobRepository extends RepositoryAccessor<PlaceInstanceJob> {
  constructor(@InjectRepository(PlaceInstanceJob) injectedRepo) {
    super(injectedRepo, ['placeInstance', 'player', 'start', 'end']);
  }
}

@Injectable()
export class PlaceInstanceJobsService extends AbstractService<PlaceInstanceJob> {
  constructor(repo: PlaceInstanceJobRepository) {
    super(repo);
  }
}

@Injectable()
export class PlaceInstanceJobMapper extends AbstractDtoMapper<PlaceInstanceJob, PlaceInstanceJobDto> {
  constructor(private readonly placesService: PlacesService,
              private readonly playersService: PlayersService,
              private readonly placeInstancesService: PlaceInstancesService) {
    super();
  }

  async toDto(domain: PlaceInstanceJob): Promise<PlaceInstanceJobDto> {
    if (!domain) {
      return null;
    }

    const dto: PlaceInstanceJobDto = {
      id: domain.id,
      type: domain.type,
      name: domain.name,
      description: domain.description,
      load: domain.load,
      payType: domain.payType,
      pay: domain.pay,
      startTime: domain.startTime?.toISOString(),
      startId: domain.start?.id,
      endId: domain.end?.id,
      placeInstanceId: domain.placeInstance?.id,
      playerId: domain.player?.id,
      content: domain.content
    };

    return dto;
  }

  async toDomain(dto: PlaceInstanceJobDto, domain?: Partial<PlaceInstanceJob> | PlaceInstanceJob): Promise<PlaceInstanceJob> {
    if (!dto) {
      return domain as any as PlaceInstanceJob;
    }

    if (!domain) {
      domain = {};
    }

    const startId = dto.startId ?? domain.start?.id;
    const endId = dto.endId ?? domain.end?.id;
    const placeInstanceId = dto.placeInstanceId ?? domain.placeInstance?.id;
    const playerId = dto.playerId ?? domain.player?.id;
    const startTime = dto.startTime ? new Date(dto.startTime) : domain.startTime;

    const fixedDto = omit(
      { ...dto },
      ['startId', 'endId', 'placeInstanceId', 'playerId', 'startTime']);

    return {
      ...domain,
      ...fixedDto,
      start: await this.placesService.findOne(startId),
      end: await this.placesService.findOne(endId),
      startTime,
      placeInstance: await this.placeInstancesService.findOne(placeInstanceId),
      player: await this.playersService.findOne(playerId)
    } as PlaceInstanceJob;
  }
}

@Controller('place-instance-jobs')
@UseFilters(AllExceptionsFilter)
export class PlaceInstanceJobsController extends AbstractServiceController<PlaceInstanceJob, PlaceInstanceJobDto> {
  constructor(service: PlaceInstanceJobsService, mapper: PlaceInstanceJobMapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [PlaceModule, PlayersModule, PlaceInstancesModule, TypeOrmModule.forFeature([PlaceInstanceJob])],
  controllers: [PlaceInstanceJobsController],
  providers: [PlaceInstanceJobsService, PlaceInstanceJobMapper, PlaceInstanceJobRepository],
  exports: [PlaceInstanceJobsService, PlaceInstanceJobMapper]
})
export class PlaceInstanceJobsModule {}
