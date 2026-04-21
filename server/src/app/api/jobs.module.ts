import { Body, Controller, Delete, forwardRef, Get, HttpException, HttpStatus, Inject, Injectable, Module, Param, Post, Put, Patch, Query, UseFilters } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { omit } from 'lodash';
import { Types } from 'mongoose';

import { AuthenticationModule } from '../../authentication/authentication.module';
import { AbstractMongoDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractMongoEntity } from '../../utils/abstract-mongo.entity';
import { AbstractMongoService } from '../../utils/abstract-mongo.service';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';
import { PlaceInstancesModule, PlaceInstancesService } from './place-instance.module';

export enum JobType {
  PLACE = 'PLACE',
  VEHICLE = 'VEHICLE'
}

@Schema({ collection: 'jobs' })
export class Job extends AbstractMongoEntity {
  @Prop({ required: true })
  @Expose()
  type: JobType;

  @Prop({ required: true })
  @Expose()
  name: string;

  @Prop()
  @Expose()
  description: string;

  @Prop({ required: true })
  @Expose()
  cargoType: string;

  @Prop({ type: Object })
  @Expose()
  start: any;

  @Prop({ type: Object })
  @Expose()
  end: any;

  @Prop()
  @Expose()
  load: number;

  @Prop({ name: 'pay_type' })
  @Expose()
  payType: string;

  @Prop()
  @Expose()
  pay: number;

  @Prop({ name: 'start_time' })
  @Expose()
  startTime: Date;

  @Prop({ type: Types.ObjectId, ref: 'Place' })
  startPlaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Place' })
  endPlaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PlaceInstance' })
  placeInstanceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'VehicleInstance' })
  vehicleInstanceId: Types.ObjectId;

  @Prop({ name: 'place_id' })
  @Expose()
  placeId: string;

  @Prop({ name: 'vehicle_id' })
  @Expose()
  vehicleId: string;

  @Prop({ type: Object })
  @Expose()
  content: any;
}

export type JobDocument = HydratedDocument<Job>;
export const JobSchema = SchemaFactory.createForClass(Job);

export interface JobDto {
  id?: string;
  name: string;
  description: string;
  type: string;
  cargoType: string;
  startId: string;
  endId: string;
  load: number;
  payType: string;
  pay: number;
  startTime: string;
  startPlaceId: string;
  endPlaceId: string;
  placeInstanceId: string;
  vehicleInstanceId: string;
  placeId: string;
  vehicleId: string;
  content: any;
  created?: string;
  updated?: string;
}

export interface JobOffer {
  jobOfferId: string;
  name: string;
  description: string;
  cargoType: string;
  startId: string;
  endId: string;
  load: number;
  payType: string;
  pay: number;
  startTime: Date;
  content: any;
}

export interface JobOfferDto {
  name: string;
  description: string;
  cargoType: string;
  startId: string;
  endId: string;
  load: number;
  payType: string;
  pay: number;
  startTime: Date;
  content: any;
}

@Injectable()
export class JobsService extends AbstractMongoService<Job> {
  constructor(@InjectModel(Job.name) private readonly jobModel: Model<JobDocument>) {
    super(jobModel);
  }
}

@Injectable()
export class JobMapper extends AbstractMongoDtoMapper<Job, JobDto> {
  constructor(
    @Inject(forwardRef(() => PlaceInstancesService))
    private readonly placeInstancesService: PlaceInstancesService
  ) {
    super();
  }

  async toDto(domain: Job): Promise<JobDto> {
    if (!domain) {
      return null;
    }

    const dto: JobDto = {
      id: (domain as any).id || (domain as any)._id?.toString(),
      type: domain.type,
      name: domain.name,
      description: domain.description,
      content: domain.content,
      cargoType: domain.cargoType,
      load: domain.load,
      payType: domain.payType,
      pay: domain.pay,
      startTime: domain.startTime?.toISOString(),
      startId: (domain as any).startId || (domain as any).start?._id?.toString(),
      endId: (domain as any).endId || (domain as any).end?._id?.toString(),
      startPlaceId: domain.startPlaceId?.toString(),
      endPlaceId: domain.endPlaceId?.toString(),
      placeInstanceId: domain.placeInstanceId?.toString(),
      vehicleInstanceId: domain.vehicleInstanceId?.toString(),
      placeId: domain.placeId,
      vehicleId: domain.vehicleId,
    };

    return dto;
  }

  async toDomain(dto: JobDto, domain?: Job | Partial<Job>): Promise<Job> {
    if (!dto) {
      return domain as Job;
    }

    if (!domain) {
      domain = {} as Partial<Job>;
    }

    const startId = dto.startId ?? ((domain as any).startId || (domain as any).start?._id?.toString());
    const endId = dto.endId ?? ((domain as any).endId || (domain as any).end?._id?.toString());
    const startTime = dto.startTime ? new Date(dto.startTime) : (domain as any).startTime;

    const fixedDto = omit({ ...dto }, [
      'startId',
      'endId',
      'startTime',
      'startPlaceId',
      'endPlaceId',
      'placeInstanceId',
      'vehicleInstanceId'
    ]);

    let start: any = (domain as any).start;
    let end: any = (domain as any).end;

    if (startId || endId) {
      const [startData, endData] = await Promise.all([
        startId ? this.placeInstancesService.findOne(startId) : Promise.resolve(null),
        endId ? this.placeInstancesService.findOne(endId) : Promise.resolve(null)
      ]);
      start = startData || start;
      end = endData || end;
    }

    return {
      ...domain,
      ...fixedDto,
      start,
      end,
      startTime,
      startPlaceId: dto.startPlaceId ? new Types.ObjectId(dto.startPlaceId) : (domain as any).startPlaceId,
      endPlaceId: dto.endPlaceId ? new Types.ObjectId(dto.endPlaceId) : (domain as any).endPlaceId,
      placeInstanceId: dto.placeInstanceId ? new Types.ObjectId(dto.placeInstanceId) : (domain as any).placeInstanceId,
      vehicleInstanceId: dto.vehicleInstanceId ? new Types.ObjectId(dto.vehicleInstanceId) : (domain as any).vehicleInstanceId
    } as Job;
  }
}

@Controller('jobs')
@UseFilters(AllExceptionsFilter)
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly jobMapper: JobMapper
  ) {
  }

  @Get()
  async findAll(@Query() pagination: any) {
    return this.jobsService.findAll(pagination).then(this.handlePagedResults());
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const domain = await this.jobsService.findOne(id);
    if (!domain) {
      throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
    }
    return this.jobMapper.toDto(domain);
  }

  @Post()
  async create(@Body() dto: JobDto) {
    const domain = await this.jobMapper.toDomain(dto);
    const created = await this.jobsService.create(domain as any);
    return this.jobMapper.toDto(created);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: JobDto) {
    const existing = await this.jobsService.findOne(id);
    if (!existing) {
      throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
    }
    const domain = await this.jobMapper.toDomain(dto, existing);
    const updated = await this.jobsService.update(id, domain as any);
    return this.jobMapper.toDto(updated);
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() dto: JobDto) {
    const existing = await this.jobsService.findOne(id);
    if (!existing) {
      throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
    }
    const domain = await this.jobMapper.toDomain(dto, existing);
    const updated = await this.jobsService.update(id, domain as any);
    return this.jobMapper.toDto(updated);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.jobsService.delete(id);
  }

  private handlePagedResults() {
    return async (page: any) => {
      const mappedData = await Promise.all(page?.data?.map(async item => {
        return await this.jobMapper.toDto(item);
      }) || []);
      return { ...page, data: mappedData };
    };
  }
}

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    forwardRef(() => PlaceInstancesModule),
    AuthenticationModule
  ],
  controllers: [JobsController],
  providers: [JobsService, JobMapper],
  exports: [JobsService, JobMapper]
})
export class JobsModule {}