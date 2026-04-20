import { Body, Controller, forwardRef, Get, HttpException, HttpStatus, Inject, Injectable, Module, Param, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { omit } from 'lodash';
import { AbstractEntity } from '../../utils/abstract.entity';
import { Column, Entity } from 'typeorm';
import { ObjectId } from 'mongodb';

import { LoggedIn } from '../../authentication/authentication.guard';
import { PageDto } from '../../models/page.model';
import { PageRequestDto } from '../../models/pagination.model';
import { AbstractDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../utils/abstract-service.controller';
import { AbstractService } from '../../utils/abstract.service';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../utils/repository-accessor';

import { Place, PlacesModule, PlacesService } from './places.module';
import { JobOffer, JobOfferDto, JobsModule, JobsService } from './jobs.module';

@Entity({ name: 'place_instances' })
export class PlaceInstance extends AbstractEntity {
  @Column('objectId')
  @Expose()
  placeId: ObjectId;

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

/**
 * Request DTO for accepting a job offer from a place instance.
 */
export interface AcceptJobDto {
  /** The jobOfferId of the offer to accept */
  jobOfferId: string;
}

/**
 * Request DTO for warehousing a job at a place instance.
 */
export interface WarehouseJobDto {
  /** The jobOfferId of the offer to warehouse */
  jobOfferId: string;
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
    return this.findAllWhere({ playerId: new ObjectId(playerId) }, pagination);
  }

  /**
   * Find a job offer by jobOfferId within a place instance.
   *
   * @param placeInstanceId - The place instance ID
   * @param jobOfferId - The job offer ID to find
   * @returns The matching JobOffer or null
   */
  async findJobOffer(placeInstanceId: string, jobOfferId: string): Promise<JobOffer | null> {
    const placeInst = await this.findOne(placeInstanceId);
    if (!placeInst || !placeInst.jobOffers) {
      return null;
    }
    return placeInst.jobOffers.find(o => o.jobOfferId === jobOfferId) || null;
  }

  /**
   * Remove a job offer from a place instance's jobOffers array.
   *
   * @param placeInstanceId - The place instance ID
   * @param jobOfferId - The job offer ID to remove
   */
  async removeJobOffer(placeInstanceId: string, jobOfferId: string): Promise<void> {
    const placeInst = await this.findOne(placeInstanceId);
    if (!placeInst || !placeInst.jobOffers) {
      return;
    }
    placeInst.jobOffers = placeInst.jobOffers.filter(o => o.jobOfferId !== jobOfferId);
    await this.update(placeInstanceId, placeInst);
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

    // Fetch the place template if we have a placeId
    const place = domain.placeId ? await this.placesService.findOne(domain.placeId.toString()) : null;

    const dto: PlaceInstanceDto = {
      id: domain._id.toString(),
      placeId: domain.placeId?.toString(),
      gameId: domain.gameId?.toString(),
      playerId: domain.playerId?.toString(),
      place: place ? {
        id: place._id?.toString(),
        name: place.name,
        description: place.description,
        type: place.type,
        lat: place.lat,
        lng: place.lng,
        gameId: place.gameId?.toString()
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

    const placeId = dto.placeId ?? domain.placeId?.toString();
    const gameId = dto.gameId ?? domain.gameId?.toString();
    const playerId = dto.playerId ?? domain.playerId?.toString();

    const fixedDto = omit(dto, ['placeId', 'gameId', 'playerId']);

    return {
      ...domain,
      ...fixedDto,
      placeId: placeId ? new ObjectId(placeId) : domain.placeId,
      gameId: gameId ? new ObjectId(gameId) : domain.gameId,
      playerId: playerId ? new ObjectId(playerId) : domain.playerId
    } as unknown as PlaceInstance;
  }
}

@Controller('place-instances')
@UseFilters(AllExceptionsFilter)
export class PlaceInstanceController extends AbstractServiceController<PlaceInstance, PlaceInstanceDto> {
  constructor(
    service: PlaceInstancesService,
    mapper: PlaceInstanceMapper,
    @Inject(forwardRef(() => JobsService)) private readonly jobsService: JobsService
  ) {
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

  /**
   * GET /place-instances/:id/jobs
   * Get job offers at an owned place instance.
   *
   * @param id - Place instance ID
   * @returns Array of job offers at this place
   */
  @Get(':id/jobs')
  @UseGuards(LoggedIn)
  async getJobs(@Param('id') id: string): Promise<JobOfferDto[]> {
    const placeInstance = await this.service.findOne(id);
    if (!placeInstance) {
      throw new HttpException('Place instance not found', HttpStatus.NOT_FOUND);
    }
    return placeInstance.jobOffers || [];
  }

  /**
   * POST /place-instances/:id/accept-job
   * Accept a job offer from a place instance. Creates a Job entity.
   * The job will be of type VEHICLE so it can be loaded into a vehicle.
   *
   * @param id - Place instance ID
   * @param acceptJobDto - The jobOfferId to accept
   * @returns The created Job
   */
  @Post(':id/accept-job')
  @UseGuards(LoggedIn)
  async acceptJob(
    @Param('id') id: string,
    @Body() acceptJobDto: AcceptJobDto
  ): Promise<any> {
    const { jobOfferId } = acceptJobDto;

    // Find the job offer
    const jobOffer = await (this.service as PlaceInstancesService).findJobOffer(id, jobOfferId);
    if (!jobOffer) {
      throw new HttpException('Job offer not found', HttpStatus.NOT_FOUND);
    }

    // Get place instance for player/game context
    const placeInstance = await this.service.findOne(id);
    if (!placeInstance) {
      throw new HttpException('Place instance not found', HttpStatus.NOT_FOUND);
    }

    // Create the job entity
    const job = {
      type: 'VEHICLE' as const,
      name: jobOffer.name,
      description: jobOffer.description,
      cargoType: jobOffer.cargoType,
      load: jobOffer.load,
      payType: jobOffer.payType,
      pay: jobOffer.pay,
      startTime: new Date(),
      startPlaceId: jobOffer.startId,
      endPlaceId: jobOffer.endId,
      placeInstanceId: placeInstance._id,
      content: jobOffer.content
    };

    const createdJob = await this.jobsService.create(job as any);

    // Remove the offer from the place instance
    await (this.service as PlaceInstancesService).removeJobOffer(id, jobOfferId);

    return this.jobsService.findOne(createdJob._id.toString()).then(j => j);
  }

  /**
   * POST /place-instances/:id/warehouse-job
   * Warehouse a job at a place instance (leave job at place).
   * The job will be of type PLACE so it stays at the place.
   *
   * @param id - Place instance ID
   * @param warehouseJobDto - The jobOfferId to warehouse
   * @returns The created Job
   */
  @Post(':id/warehouse-job')
  @UseGuards(LoggedIn)
  async warehouseJob(
    @Param('id') id: string,
    @Body() warehouseJobDto: WarehouseJobDto
  ): Promise<any> {
    const { jobOfferId } = warehouseJobDto;

    // Find the job offer
    const jobOffer = await (this.service as PlaceInstancesService).findJobOffer(id, jobOfferId);
    if (!jobOffer) {
      throw new HttpException('Job offer not found', HttpStatus.NOT_FOUND);
    }

    // Get place instance for player/game context
    const placeInstance = await this.service.findOne(id);
    if (!placeInstance) {
      throw new HttpException('Place instance not found', HttpStatus.NOT_FOUND);
    }

    // Create the job entity with type PLACE
    const job = {
      type: 'PLACE' as const,
      name: jobOffer.name,
      description: jobOffer.description,
      cargoType: jobOffer.cargoType,
      load: jobOffer.load,
      payType: jobOffer.payType,
      pay: jobOffer.pay,
      startTime: new Date(),
      startPlaceId: jobOffer.startId,
      endPlaceId: jobOffer.endId,
      placeInstanceId: placeInstance._id,
      content: jobOffer.content
    };

    const createdJob = await this.jobsService.create(job as any);

    // Remove the offer from the place instance
    await (this.service as PlaceInstancesService).removeJobOffer(id, jobOfferId);

    return this.jobsService.findOne(createdJob._id.toString()).then(j => j);
  }
}

@Module({
  imports: [PlacesModule, forwardRef(() => JobsModule), TypeOrmModule.forFeature([PlaceInstance])],
  controllers: [PlaceInstanceController],
  providers: [PlaceInstancesService, PlaceInstanceMapper, PlaceInstanceRepository],
  exports: [PlaceInstancesService, PlaceInstanceMapper, PlaceInstancesService]
})
export class PlaceInstancesModule {}
