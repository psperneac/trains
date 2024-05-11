import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { omit } from 'lodash';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { MapPlacesService, MapPlacesModule } from './map-places.module';
import { MapTemplateModule, MapTemplateService } from '../maps/map-template.module';
import { MapPlaceInstanceJobOffer, MapPlaceInstanceJobOfferDto } from './map-place-instance-job-offer.entity';
import { MapPlaceInstancesModule, MapPlaceInstancesService } from './map-place-instance.module';

@Injectable()
export class MapPlaceInstanceJobOfferRepository extends RepositoryAccessor<MapPlaceInstanceJobOffer> {
  constructor(@InjectRepository(MapPlaceInstanceJobOffer) injectedRepo) {
    super(injectedRepo, ['placeInstance', 'player', 'map', 'start', 'end']);
  }
}

@Injectable()
export class MapPlaceInstanceJobOffersService extends AbstractService<MapPlaceInstanceJobOffer> {
  constructor(repo: MapPlaceInstanceJobOfferRepository) {
    super(repo);
  }
}

@Injectable()
export class MapPlaceInstanceJobOfferMapper extends AbstractDtoMapper<
  MapPlaceInstanceJobOffer,
  MapPlaceInstanceJobOfferDto
> {
  constructor(
    private readonly placesService: MapPlacesService,
    private readonly mapService: MapTemplateService,
    private readonly placeInstancesService: MapPlaceInstancesService,
  ) {
    super();
  }

  async toDto(domain: MapPlaceInstanceJobOffer): Promise<MapPlaceInstanceJobOfferDto> {
    if (!domain) {
      return null;
    }

    const dto: MapPlaceInstanceJobOfferDto = {
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
      mapPlaceInstanceId: domain.mapPlaceInstance?.id,
      playerId: domain.playerId,
      mapId: domain.map?.id,
      jobOfferExpiry: domain.jobOfferExpiry?.toISOString(),
      content: domain.content,
    };

    return dto;
  }

  async toDomain(
    dto: MapPlaceInstanceJobOfferDto,
    domain?: Partial<MapPlaceInstanceJobOffer> | MapPlaceInstanceJobOffer,
  ): Promise<MapPlaceInstanceJobOffer> {
    if (!dto) {
      return domain as any as MapPlaceInstanceJobOffer;
    }

    if (!domain) {
      domain = {};
    }

    const startId = dto.startId ?? domain.start?.id;
    const endId = dto.endId ?? domain.end?.id;
    const mapPlaceInstanceId = dto.mapPlaceInstanceId ?? domain.mapPlaceInstance?.id;
    const mapId = dto.mapId ?? domain.map?.id;
    const startTime = dto.startTime ? new Date(dto.startTime) : domain.startTime;
    const jobOfferExpiry = dto.jobOfferExpiry ? new Date(dto.jobOfferExpiry) : domain.jobOfferExpiry;

    const fixedDto = omit({ ...dto }, ['startId', 'endId', 'placeInstanceId', 'mapId', 'startTime']);

    return {
      ...domain,
      ...fixedDto,
      start: await this.placesService.findOne(startId),
      end: await this.placesService.findOne(endId),
      startTime,
      jobOfferExpiry,
      mapPlaceInstance: await this.placeInstancesService.findOne(mapPlaceInstanceId),
      map: await this.mapService.findOne(mapId),
    } as MapPlaceInstanceJobOffer;
  }
}

@Controller('map-place-instance-job-offers')
@UseFilters(AllExceptionsFilter)
export class MapPlaceInstanceJobOffersController extends AbstractServiceController<
  MapPlaceInstanceJobOffer,
  MapPlaceInstanceJobOfferDto
> {
  constructor(service: MapPlaceInstanceJobOffersService, mapper: MapPlaceInstanceJobOfferMapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [
    MapPlacesModule,
    MapPlaceInstancesModule,
    MapTemplateModule,
    TypeOrmModule.forFeature([MapPlaceInstanceJobOffer]),
  ],
  controllers: [MapPlaceInstanceJobOffersController],
  providers: [MapPlaceInstanceJobOffersService, MapPlaceInstanceJobOfferMapper, MapPlaceInstanceJobOfferRepository],
  exports: [MapPlaceInstanceJobOffersService, MapPlaceInstanceJobOfferMapper],
})
export class MapPlaceInstanceJobOffersModule {}
