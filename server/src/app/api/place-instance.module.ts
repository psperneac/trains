import { Controller, Get, Injectable, Module, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { omit } from 'lodash';
import { AbstractEntity } from '../../utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, ObjectId } from 'typeorm';
import { Types } from 'mongoose';

import { LoggedIn } from '../../authentication/authentication.guard';
import { PageDto } from '../../models/page.model';
import { PageRequestDto } from '../../models/pagination.model';
import { AbstractDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../utils/abstract-service.controller';
import { AbstractService } from '../../utils/abstract.service';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../utils/repository-accessor';

import { Place, PlacesModule, PlacesService } from './places.module';
import { JobOffer, JobOfferDto } from './jobs.module';

@Entity({ name: 'map_place_instances' })
export class PlaceInstance extends AbstractEntity {
  @ManyToOne(type => Place, { eager: true })
  @JoinColumn({ name: 'place_id' })
  @Expose()
  place: Place;

  @Column('objectId')
  @Expose()
  gameId: ObjectId;

  @Column('objectId')
  @Expose()
  playerId: ObjectId;

  @Column()
  @Expose()
  jobOffers: JobOffer[];

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface PlaceInstanceDto {
  id: string;
  placeId: string;
  gameId: string;
  playerId: string;
  place?: any;
  jobOffers: JobOfferDto[];
  content: any;
}

@Injectable()
export class PlaceInstanceRepository extends RepositoryAccessor<PlaceInstance> {
  constructor(@InjectRepository(PlaceInstance) injectedRepo) {
    super(injectedRepo, ['place', 'map', 'jobs', 'jobOffers']);
  }
}

@Injectable()
export class PlaceInstancesService extends AbstractService<PlaceInstance> {
  constructor(repo: PlaceInstanceRepository) {
    super(repo);
  }

  findAllByPlayerAndMap(
    pagination: PageRequestDto,
    playerId: string,
    mapId: string
  ): Promise<PageDto<PlaceInstance>> {
    return this.findAllWithQuery(
      pagination,
      'map_place_instances.map.id = :mapId and map_place_instances.player.id = :playerId',
      { mapId, playerId }
    ) as Promise<PageDto<PlaceInstance>>;
  }

  findAllByPlayer(pagination: PageRequestDto, playerId: string): Promise<PageDto<PlaceInstance>> {
    return this.findAllWithQuery(
      pagination,
      'map_place_instances.playerId = :playerId',
      { playerId: new Types.ObjectId(playerId) }
    ) as Promise<PageDto<PlaceInstance>>;
  }
}

@Injectable()
export class PlaceInstanceMapper extends AbstractDtoMapper<PlaceInstance, PlaceInstanceDto> {
  constructor(private readonly placesService: PlacesService) {
    super();
  }

  async toDto(domain: PlaceInstance): Promise<PlaceInstanceDto> {
    if (!domain) {
      return null;
    }

    const dto: PlaceInstanceDto = {
      id: domain._id.toString(),
      placeId: domain.place?._id.toString(),
      gameId: domain.gameId?.toString(),
      playerId: domain.playerId?.toString(),
      place: domain.place ? {
        id: domain.place._id?.toString(),
        name: domain.place.name,
        description: domain.place.description,
        type: domain.place.type,
        lat: domain.place.lat,
        lng: domain.place.lng,
        gameId: domain.place.gameId?.toString()
      } : undefined,
      jobOffers: domain.jobOffers?.map(j => j as JobOfferDto),
      content: domain.content
    };

    return dto;
  }

  async toDomain(
    dto: PlaceInstanceDto,
    domain?: Partial<PlaceInstance> | PlaceInstance
  ): Promise<PlaceInstance> {
    if (!dto) {
      return domain as any as PlaceInstance;
    }

    if (!domain) {
      domain = {};
    }

    const placeId = dto.placeId ?? domain.place?._id.toString();

    const fixedDto = omit(dto, ['placeId']);

    return {
      ...domain,
      ...fixedDto,
      mapPlace: await this.placesService.findOne(placeId)
    } as any as PlaceInstance;
  }
}

@Controller('place-instances')
@UseFilters(AllExceptionsFilter)
export class PlaceInstanceController extends AbstractServiceController<PlaceInstance, PlaceInstanceDto> {
  constructor(service: PlaceInstancesService, mapper: PlaceInstanceMapper) {
    super(service, mapper);
  }

  @Get('by-player/:playerId')
  @UseGuards(LoggedIn)
  async findAllByPlayer(
    @Query() pagination: PageRequestDto,
    @Param('playerId') playerId: string
  ): Promise<PageDto<PlaceInstanceDto>> {
    return (this.service as PlaceInstancesService)
      .findAllByPlayer(pagination, playerId)
      .then(this.makeHandler());
  }

  @Get('by-player-and-map/:playerId/:mapId')
  @UseGuards(LoggedIn)
  async findAllByPlayerAndMap(
    pagination: PageRequestDto,
    playerId: string,
    mapId: string
  ): Promise<PageDto<PlaceInstanceDto>> {
    return (this.service as PlaceInstancesService)
      .findAllByPlayerAndMap(pagination, playerId, mapId)
      .then(this.makeHandler());
  }
}

@Module({
  imports: [PlacesModule, TypeOrmModule.forFeature([PlaceInstance])],
  controllers: [PlaceInstanceController],
  providers: [PlaceInstancesService, PlaceInstanceMapper, PlaceInstanceRepository],
  exports: [PlaceInstancesService, PlaceInstanceMapper]
})
export class PlaceInstancesModule {}
