import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { PlaceInstance, PlaceInstanceDto } from './place-instance.entity';
import { PlaceModule, PlacesService } from './place.module';
import { omit } from 'lodash';
import { PlayersModule, PlayersService } from '../players/player.module';

@Injectable()
export class PlaceInstanceRepository extends RepositoryAccessor<PlaceInstance> {
  constructor(@InjectRepository(PlaceInstance) injectedRepo) {
    super(injectedRepo, ['place', 'player', 'jobs', 'jobOffers']);
  }
}

@Injectable()
export class PlaceInstancesService extends AbstractService<PlaceInstance> {
  constructor(repo: PlaceInstanceRepository) {
    super(repo);
  }
}

@Injectable()
export class PlaceInstanceMapper extends AbstractDtoMapper<PlaceInstance, PlaceInstanceDto> {
  constructor(private readonly placesService: PlacesService, private readonly playersService: PlayersService) {
    super();
  }

  async toDto(domain: PlaceInstance): Promise<PlaceInstanceDto> {
    if (!domain) {
      return null;
    }

    const dto: PlaceInstanceDto = {
      id: domain.id,
      placeId: domain.place?.id,
      playerId: domain.player?.id,
      jobs: domain.jobs?.map(j => j.id),
      jobOffers: domain.jobOffers?.map(j => j.id),
      content: domain.content
    };

    return dto;
  }

  async toDomain(dto: PlaceInstanceDto, domain?: Partial<PlaceInstance> | PlaceInstance): Promise<PlaceInstance> {
    if (!dto) {
      return domain as any as PlaceInstance;
    }

    if (!domain) {
      domain = {};
    }

    const placeId = dto.placeId ?? domain.place?.id;
    const playerId = dto.playerId ?? domain.player?.id;

    const fixedDto = omit(dto, ['placeId', 'playerId']);

    return Promise.all([this.placesService.findOne(placeId), this.playersService.findOne(playerId)]).then(([place, player]) => {
      return {
        ...domain,
        ...fixedDto,
        place,
        player
      } as any as PlaceInstance;
    });
  }
}

@Controller('place-instances')
@UseFilters(AllExceptionsFilter)
export class PlaceInstanceController extends AbstractServiceController<PlaceInstance, PlaceInstanceDto> {
  constructor(service: PlaceInstancesService, mapper: PlaceInstanceMapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [PlaceModule, PlayersModule, TypeOrmModule.forFeature([PlaceInstance])],
  controllers: [PlaceInstanceController],
  providers: [PlaceInstancesService, PlaceInstanceMapper, PlaceInstanceRepository],
  exports: [PlaceInstancesService, PlaceInstanceMapper]
})
export class PlaceInstancesModule {}
