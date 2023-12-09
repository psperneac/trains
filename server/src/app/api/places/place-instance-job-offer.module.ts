import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { CONTAINS } from 'class-validator';
import { omit } from 'lodash';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { PlayersModule, PlayersService } from '../players/player.module';
import { PlaceInstanceJobOffer, PlaceInstanceJobOfferDto } from './place-instance-job-offer.entity';
import { PlaceInstancesModule, PlaceInstancesService } from './place-instance.module';
import { PlaceModule, PlacesService } from './place.module';

@Injectable()
export class PlaceInstanceJobOfferRepository extends RepositoryAccessor<PlaceInstanceJobOffer> {
  constructor(@InjectRepository(PlaceInstanceJobOffer) injectedRepo) {
    super(injectedRepo, ['placeInstance', 'player', 'start', 'end']);
  }
}

@Injectable()
export class PlaceInstanceJobOffersService extends AbstractService<PlaceInstanceJobOffer> {
  constructor(repo: PlaceInstanceJobOfferRepository) {
    super(repo);
  }
}

@Injectable()
export class PlaceInstanceJobOfferMapper extends AbstractDtoMapper<PlaceInstanceJobOffer, PlaceInstanceJobOfferDto> {
  constructor(private readonly placesService: PlacesService,
              private readonly playersService: PlayersService,
              private readonly placeInstancesService: PlaceInstancesService) {
    super();
  }

  async toDto(domain: PlaceInstanceJobOffer): Promise<PlaceInstanceJobOfferDto> {
    if (!domain) {
      return null;
    }

    const dto: PlaceInstanceJobOfferDto = {
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
      jobOfferExpiry: domain.jobOfferExpiry?.toISOString(),
      content: domain.content
    };

    return dto;
  }

  async toDomain(dto: PlaceInstanceJobOfferDto, domain?: Partial<PlaceInstanceJobOffer> | PlaceInstanceJobOffer): Promise<PlaceInstanceJobOffer> {
    if (!dto) {
      return domain as any as PlaceInstanceJobOffer;
    }

    if (!domain) {
      domain = {};
    }

    const startId = dto.startId ?? domain.start?.id;
    const endId = dto.endId ?? domain.end?.id;
    const placeInstanceId = dto.placeInstanceId ?? domain.placeInstance?.id;
    const playerId = dto.playerId ?? domain.player?.id;
    const startTime = dto.startTime ? new Date(dto.startTime) : domain.startTime;
    const jobOfferExpiry = dto.jobOfferExpiry ? new Date(dto.jobOfferExpiry) : domain.jobOfferExpiry;

    const fixedDto = omit(
      { ...dto },
      ['startId', 'endId', 'placeInstanceId', 'playerId', 'startTime']);

    return {
      ...domain,
      ...fixedDto,
      start: await this.placesService.findOne(startId),
      end: await this.placesService.findOne(endId),
      startTime,
      jobOfferExpiry,
      placeInstance: await this.placeInstancesService.findOne(placeInstanceId),
      player: await this.playersService.findOne(playerId)
    } as PlaceInstanceJobOffer;
  }
}

@Controller('place-instance-jobs')
@UseFilters(AllExceptionsFilter)
export class PlaceInstanceJobOffersController extends AbstractServiceController<PlaceInstanceJobOffer, PlaceInstanceJobOfferDto> {
  constructor(service: PlaceInstanceJobOffersService, mapper: PlaceInstanceJobOfferMapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [PlaceModule, PlayersModule, PlaceInstancesModule, TypeOrmModule.forFeature([PlaceInstanceJobOffer])],
  controllers: [PlaceInstanceJobOffersController],
  providers: [PlaceInstanceJobOffersService, PlaceInstanceJobOfferMapper, PlaceInstanceJobOfferRepository],
  exports: [PlaceInstanceJobOffersService, PlaceInstanceJobOfferMapper]
})
export class PlaceInstanceJobOffersModule {}
