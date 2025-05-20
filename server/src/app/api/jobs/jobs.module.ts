import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { omit } from 'lodash';

import { AuthenticationModule } from '../../../authentication/authentication.module';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { MapPlacesModule, MapPlacesService } from '../places/map-place.module';

import { Job, JobDto } from './job.entity';

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
  constructor(private readonly service: MapPlacesService) {
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
      load: domain.load,
      payType: domain.payType,
      pay: domain.pay,
      startTime: domain.startTime?.toISOString(),
      startId: domain.start?._id.toString(),
      endId: domain.end?._id.toString()
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

    const fixedDto = omit({ ...dto }, ['startId', 'endId', 'startTime']);

    return {
      ...domain,
      ...fixedDto,
      start: this.service.findOne(startId),
      end: this.service.findOne(endId),
      startTime
    } as any as Job;
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
  imports: [MapPlacesModule, TypeOrmModule.forFeature([Job]), AuthenticationModule],
  controllers: [JobsController],
  providers: [JobsService, JobMapper, JobRepository],
  exports: [JobsService, JobMapper]
})
export class JobsModule {}
