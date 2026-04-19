import { Controller, forwardRef, Inject, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { omit } from 'lodash';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';

import { AuthenticationModule } from '../../authentication/authentication.module';
import { AbstractDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../utils/abstract-service.controller';
import { AbstractEntity } from '../../utils/abstract.entity';
import { AbstractService } from '../../utils/abstract.service';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../utils/repository-accessor';
import { Place } from './places.module';
import { PlaceInstance, PlaceInstancesModule, PlaceInstancesService } from './place-instance.module';

export enum JobType {
  PLACE = 'PLACE',
  VEHICLE = 'VEHICLE'
}

@Entity({ name: 'jobs' })
export class Job extends AbstractEntity {
  @Column('varchar', { length: 20 })
  @Expose()
  type: JobType;

  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;

  /** Type of cargo being transported (e.g., 'Coal', 'Grain', 'Electronics') */
  @Column('varchar', { length: 100 })
  @Expose()
  cargoType: string;

  /** Origin PlaceInstance where the job was accepted or warehoused */
  @ManyToOne(_type => PlaceInstance, { eager: true })
  @JoinColumn({ name: 'start' })
  @Expose()
  start: Place;

  /** Destination PlaceInstance for job delivery */
  @ManyToOne(_type => PlaceInstance, { eager: true })
  @JoinColumn({ name: 'end' })
  @Expose()
  end: Place;

  @Column()
  @Expose()
  load: number;

  @Column({ name: 'pay_type' })
  @Expose()
  payType: string;

  @Column()
  @Expose()
  pay: number;

  @Column({ name: 'start_time' })
  @Expose()
  startTime: Date;

  /** Template Place origin - the template Place this job originates from */
  @Column('objectId')
  startPlaceId: ObjectId;

  @Column('objectId')
  endPlaceId: ObjectId;

  @Column('objectId')
  placeInstanceId: ObjectId;

  @Column('objectId')
  vehicleInstanceId: ObjectId;

  @Column({ name: 'place_id' })
  @Expose()
  placeId: string;

  @Column({ name: 'vehicle_id' })
  @Expose()
  vehicleId: string;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface JobDto {
  id: string;
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
}

export interface JobOffer {
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
export class JobRepository extends RepositoryAccessor<Job> {
  constructor(@InjectRepository(Job) injectedRepo) {
    super(injectedRepo, ['start', 'end']);
  }
}

@Injectable()
export class JobsService extends AbstractService<Job> {
  constructor(repo: JobRepository) {
    super(repo);
  }
}

@Injectable()
export class JobMapper extends AbstractDtoMapper<Job, JobDto> {
  constructor(
    @Inject(forwardRef(() => PlaceInstancesService))
    private readonly service: PlaceInstancesService
  ) {
    super();
  }

  async toDto(domain: Job): Promise<JobDto> {
    if (!domain) {
      return null;
    }

    const dto: JobDto = {
      id: domain._id.toString(),
      type: domain.type,
      name: domain.name,
      description: domain.description,
      content: domain.content,
      cargoType: domain.cargoType,
      load: domain.load,
      payType: domain.payType,
      pay: domain.pay,
      startTime: domain.startTime?.toISOString(),
      startId: domain.start?._id.toString(),
      endId: domain.end?._id.toString(),
      startPlaceId: domain.startPlaceId?.toString(),
      endPlaceId: domain.endPlaceId?.toString(),
      placeInstanceId: domain.placeInstanceId?.toString(),
      vehicleInstanceId: domain.vehicleInstanceId?.toString(),
      placeId: domain.placeId,
      vehicleId: domain.vehicleId
    };

    return dto;
  }

  async toDomain(dto: JobDto, domain?: Partial<Job> | Job): Promise<Job> {
    if (!dto) {
      return domain as any as Job;
    }

    if (!domain) {
      domain = {};
    }

    const startId = dto.startId ?? domain.start?._id.toString();
    const endId = dto.endId ?? domain.end?._id.toString();
    const startTime = dto.startTime ? new Date(dto.startTime) : domain.startTime;

    const fixedDto = omit({ ...dto }, [
      'startId',
      'endId',
      'startTime',
      'startPlaceId',
      'endPlaceId',
      'placeInstanceId',
      'vehicleInstanceId'
    ]);

    const [start, end] = await Promise.all([
      this.service.findOne(startId),
      this.service.findOne(endId)
    ]);

    return {
      ...domain,
      ...fixedDto,
      start,
      end,
      startTime,
      startPlaceId: dto.startPlaceId ? new Types.ObjectId(dto.startPlaceId) : domain?.startPlaceId,
      endPlaceId: dto.endPlaceId ? new Types.ObjectId(dto.endPlaceId) : domain?.endPlaceId,
      placeInstanceId: dto.placeInstanceId ? new Types.ObjectId(dto.placeInstanceId) : domain?.placeInstanceId,
      vehicleInstanceId: dto.vehicleInstanceId ? new Types.ObjectId(dto.vehicleInstanceId) : domain?.vehicleInstanceId
    } as unknown as Job;
  }
}

@Controller('jobs')
@UseFilters(AllExceptionsFilter)
export class JobsController extends AbstractServiceController<Job, JobDto> {
  constructor(service: JobsService, mapper: JobMapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [forwardRef(() => PlaceInstancesModule), TypeOrmModule.forFeature([Job]), AuthenticationModule],
  controllers: [JobsController],
  providers: [JobsService, JobMapper, JobRepository],
  exports: [JobsService, JobMapper]
})
export class JobsModule {}
