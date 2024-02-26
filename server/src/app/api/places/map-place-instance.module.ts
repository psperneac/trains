import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { MapPlaceInstance, MapPlaceInstanceDto } from './map-place-instance.entity';
import { PlaceModule, PlacesService } from './place.module';
import { omit } from 'lodash';
import { PlayersModule, PlayersService } from '../players/player.module';

@Injectable()
export class MapPlaceInstanceRepository extends RepositoryAccessor<MapPlaceInstance> {
  constructor(@InjectRepository(MapPlaceInstance) injectedRepo) {
    super(injectedRepo, ['mapPlace', 'player', 'map', 'jobs', 'jobOffers']);
  }
}

@Injectable()
export class MapPlaceInstancesService extends AbstractService<MapPlaceInstance> {
  constructor(repo: MapPlaceInstanceRepository) {
    super(repo);
  }
}

@Injectable()
export class MapPlaceInstanceMapper extends AbstractDtoMapper<MapPlaceInstance, MapPlaceInstanceDto> {
  constructor(private readonly mapPlacesService: PlacesService, private readonly playersService: PlayersService) {
    super();
  }

  async toDto(domain: MapPlaceInstance): Promise<MapPlaceInstanceDto> {
    if (!domain) {
      return null;
    }

    const dto: MapPlaceInstanceDto = {
      id: domain.id,
      mapPlaceId: domain.mapPlace?.id,
      playerId: domain.player?.id,
      jobs: domain.jobs?.map(j => j.id),
      jobOffers: domain.jobOffers?.map(j => j.id),
      content: domain.content
    };

    return dto;
  }

  async toDomain(dto: MapPlaceInstanceDto, domain?: Partial<MapPlaceInstance> | MapPlaceInstance): Promise<MapPlaceInstance> {
    if (!dto) {
      return domain as any as MapPlaceInstance;
    }

    if (!domain) {
      domain = {};
    }

    const mapPlaceId = dto.mapPlaceId ?? domain.mapPlace?.id;
    const playerId = dto.playerId ?? domain.player?.id;

    const fixedDto = omit(dto, ['mapPlaceId', 'playerId']);

    return {
      ...domain,
      ...fixedDto,
      mapPlace: this.mapPlacesService.findOne(mapPlaceId),
      player: this.playersService.findOne(playerId),
    } as any as MapPlaceInstance;
  }
}

@Controller('map-place-instances')
@UseFilters(AllExceptionsFilter)
export class MapPlaceInstanceController extends AbstractServiceController<MapPlaceInstance, MapPlaceInstanceDto> {
  constructor(service: MapPlaceInstancesService, mapper: MapPlaceInstanceMapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [PlaceModule, PlayersModule, TypeOrmModule.forFeature([MapPlaceInstance])],
  controllers: [MapPlaceInstanceController],
  providers: [MapPlaceInstancesService, MapPlaceInstanceMapper, MapPlaceInstanceRepository],
  exports: [MapPlaceInstancesService, MapPlaceInstanceMapper]
})
export class MapPlaceInstancesModule {}
