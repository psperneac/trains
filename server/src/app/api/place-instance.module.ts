import { Body, Controller, forwardRef, Get, HttpException, HttpStatus, Inject, Injectable, Module, Param, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { omit } from 'lodash';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';

import { LoggedIn } from '../../authentication/authentication.guard';
import { PageDto } from '../../models/page.model';
import { PageRequestDto } from '../../models/pagination.model';
import { AbstractMongoDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractMongoEntity } from '../../utils/abstract-mongo.entity';
import { AbstractMongoService } from '../../utils/abstract-mongo.service';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';

import { Place, PlacesModule, PlacesService } from './places.module';
import { JobOffer, JobOfferDto, JobsModule, JobsService } from './jobs.module';

@Schema({ collection: 'place_instances' })
export class PlaceInstance extends AbstractMongoEntity {
  @Prop({ type: Types.ObjectId, ref: 'Place', required: true })
  @Expose()
  placeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  @Expose()
  gameId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  @Expose()
  playerId: Types.ObjectId;

  @Prop({ type: Object })
  @Expose()
  jobOffers: JobOffer[];

  @Prop({ type: Object })
  @Expose()
  content: any;
}

export type PlaceInstanceDocument = HydratedDocument<PlaceInstance>;
export const PlaceInstanceSchema = SchemaFactory.createForClass(PlaceInstance);

export interface PlaceInstanceDto {
  id?: string;
  placeId: string;
  gameId: string;
  playerId: string;
  place?: any;
  jobOffers: JobOfferDto[];
  content: any;
  created?: string;
  updated?: string;
}

/**
 * Request DTO for accepting a job offer from a place instance.
 */
export interface AcceptJobDto {
  jobOfferId: string;
}

/**
 * Request DTO for warehousing a job at a place instance.
 */
export interface WarehouseJobDto {
  jobOfferId: string;
}

@Injectable()
export class PlaceInstancesService extends AbstractMongoService<PlaceInstance> {
  constructor(@InjectModel(PlaceInstance.name) private readonly placeInstanceModel: Model<PlaceInstanceDocument>) {
    super(placeInstanceModel);
  }

  findAllByPlayerAndMap(
    pagination: PageRequestDto,
    playerId: string,
    mapId: string
  ): Promise<PageDto<PlaceInstance>> {
    return this.findAllWhere({ playerId: new Types.ObjectId(playerId) }, pagination);
  }

  findAllByPlayer(pagination: PageRequestDto, playerId: string): Promise<PageDto<PlaceInstance>> {
    return this.findAllWhere({ playerId: new Types.ObjectId(playerId) }, pagination);
  }

  async findJobOffer(placeInstanceId: string, jobOfferId: string): Promise<JobOffer | null> {
    const placeInst = await this.findOne(placeInstanceId);
    if (!placeInst || !placeInst.jobOffers) {
      return null;
    }
    return placeInst.jobOffers.find(o => o.jobOfferId === jobOfferId) || null;
  }

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
export class PlaceInstanceMapper extends AbstractMongoDtoMapper<PlaceInstance, PlaceInstanceDto> {
  constructor(private readonly placesService: PlacesService) {
    super();
  }

  async toDto(domain: PlaceInstance): Promise<PlaceInstanceDto> {
    if (!domain) {
      return null;
    }

    const place = domain.placeId ? await this.placesService.findOne(domain.placeId.toString()) : null;

    const dto: PlaceInstanceDto = {
      id: (domain as any).id || (domain as any)._id?.toString(),
      placeId: domain.placeId?.toString(),
      gameId: domain.gameId?.toString(),
      playerId: domain.playerId?.toString(),
      place: place ? {
        id: (place as any).id || (place as any)._id?.toString(),
        name: place.name,
        description: place.description,
        type: place.type,
        lat: place.lat,
        lng: place.lng,
        gameId: (place as any).gameId?.toString()
      } : undefined,
      jobOffers: domain.jobOffers?.map(j => j as JobOfferDto),
      content: domain.content,
    };

    return dto;
  }

  async toDomain(dto: PlaceInstanceDto, domain?: PlaceInstance | Partial<PlaceInstance>): Promise<PlaceInstance> {
    if (!dto) {
      return domain as PlaceInstance;
    }

    if (!domain) {
      domain = {} as Partial<PlaceInstance>;
    }

    const placeId = dto.placeId ?? (domain as any).placeId?.toString();
    const gameId = dto.gameId ?? (domain as any).gameId?.toString();
    const playerId = dto.playerId ?? (domain as any).playerId?.toString();

    const fixedDto = omit(dto, ['placeId', 'gameId', 'playerId']);

    return {
      ...domain,
      ...fixedDto,
      placeId: placeId ? new Types.ObjectId(placeId) : (domain as any).placeId,
      gameId: gameId ? new Types.ObjectId(gameId) : (domain as any).gameId,
      playerId: playerId ? new Types.ObjectId(playerId) : (domain as any).playerId,
    } as PlaceInstance;
  }
}

@Controller('place-instances')
@UseFilters(AllExceptionsFilter)
export class PlaceInstanceController {
  constructor(
    private readonly placeInstancesService: PlaceInstancesService,
    private readonly placeInstanceMapper: PlaceInstanceMapper,
    @Inject(forwardRef(() => JobsService)) private readonly jobsService: JobsService
  ) {
  }

  @Get('by-player/:playerId')
  @UseGuards(LoggedIn)
  async findAllByPlayer(
    @Query() pagination: PageRequestDto,
    @Param('playerId') playerId: string
  ): Promise<PageDto<PlaceInstanceDto>> {
    return this.placeInstancesService.findAllByPlayer(pagination, playerId).then(this.makeHandler());
  }

  @Get(':id')
  @UseGuards(LoggedIn)
  async findOne(@Param('id') id: string): Promise<PlaceInstanceDto> {
    return this.placeInstancesService.findOne(id).then(async domain => {
      if (!domain) {
        throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
      }
      const found = await this.placeInstanceMapper.toDto(domain);
      if (!found) {
        throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
      }
      return found;
    });
  }

  @Get()
  @UseGuards(LoggedIn)
  async findAll(@Query() pagination: PageRequestDto): Promise<PageDto<PlaceInstanceDto>> {
    return this.placeInstancesService.findAll(pagination).then(this.makeHandler());
  }

  public makeHandler() {
    return (page: PageDto<PlaceInstance>) => this.handlePagedResults(page, this.placeInstanceMapper);
  }

  public async handlePagedResults(page: PageDto<PlaceInstance>, mapper: PlaceInstanceMapper) {
    const mappedData = await Promise.all(page?.data?.map(async item => {
      return await mapper.toDto(item);
    }));
    return { ...page, data: mappedData };
  }

  @Get('by-player-and-map/:playerId/:mapId')
  @UseGuards(LoggedIn)
  async findAllByPlayerAndMap(
    pagination: PageRequestDto,
    playerId: string,
    mapId: string
  ): Promise<PageDto<PlaceInstanceDto>> {
    return this.placeInstancesService.findAllByPlayerAndMap(pagination, playerId, mapId).then(this.makeHandler());
  }

  @Get(':id/jobs')
  @UseGuards(LoggedIn)
  async getJobs(@Param('id') id: string): Promise<JobOfferDto[]> {
    const placeInstance = await this.placeInstancesService.findOne(id);
    if (!placeInstance) {
      throw new HttpException('Place instance not found', HttpStatus.NOT_FOUND);
    }
    return placeInstance.jobOffers || [];
  }

  @Post(':id/accept-job')
  @UseGuards(LoggedIn)
  async acceptJob(
    @Param('id') id: string,
    @Body() acceptJobDto: AcceptJobDto
  ): Promise<any> {
    const { jobOfferId } = acceptJobDto;

    const jobOffer = await this.placeInstancesService.findJobOffer(id, jobOfferId);
    if (!jobOffer) {
      throw new HttpException('Job offer not found', HttpStatus.NOT_FOUND);
    }

    const placeInstance = await this.placeInstancesService.findOne(id);
    if (!placeInstance) {
      throw new HttpException('Place instance not found', HttpStatus.NOT_FOUND);
    }

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

    await this.placeInstancesService.removeJobOffer(id, jobOfferId);

    return this.jobsService.findOne(createdJob._id.toString()).then(j => j);
  }

  @Post(':id/warehouse-job')
  @UseGuards(LoggedIn)
  async warehouseJob(
    @Param('id') id: string,
    @Body() warehouseJobDto: WarehouseJobDto
  ): Promise<any> {
    const { jobOfferId } = warehouseJobDto;

    const jobOffer = await this.placeInstancesService.findJobOffer(id, jobOfferId);
    if (!jobOffer) {
      throw new HttpException('Job offer not found', HttpStatus.NOT_FOUND);
    }

    const placeInstance = await this.placeInstancesService.findOne(id);
    if (!placeInstance) {
      throw new HttpException('Place instance not found', HttpStatus.NOT_FOUND);
    }

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

    await this.placeInstancesService.removeJobOffer(id, jobOfferId);

    return this.jobsService.findOne(createdJob._id.toString()).then(j => j);
  }
}

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PlaceInstance.name, schema: PlaceInstanceSchema }]),
    PlacesModule,
    forwardRef(() => JobsModule),
  ],
  controllers: [PlaceInstanceController],
  providers: [PlaceInstancesService, PlaceInstanceMapper],
  exports: [PlaceInstancesService, PlaceInstanceMapper]
})
export class PlaceInstancesModule {}