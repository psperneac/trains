import { Controller, Get, Injectable, Module, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { omit } from 'lodash';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

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

  @Column({ name: 'game_id' })
  @Expose()
  gameId: string;

  @Column({ name: 'player_id' })
  @Expose()
  playerId: string;

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
      gameId: domain.gameId,
      playerId: domain.playerId,
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
