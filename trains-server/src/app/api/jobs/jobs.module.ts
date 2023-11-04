import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { omit } from 'lodash';
import { AuthenticationModule } from '../../../authentication/authentication.module';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { PlacesModule, PlacesService } from '../places/places.module';
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
  constructor(private readonly service: PlacesService) {
    super();
  }

  async toDto(domain: Job): Promise<JobDto> {
    if (!domain) {
      return null;
    }

    const dto: JobDto = {
      id: domain.id,
      type: domain.type,
      name: domain.name,
      description: domain.description,
      content: domain.content,
      load: domain.load,
      payType: domain.payType,
      pay: domain.pay,
      startTime: domain.startTime?.toISOString(),
      startId: domain.start?.id,
      endId: domain.end?.id
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

    const startId = dto.startId ?? domain.start?.id;
    const endId = dto.endId ?? domain.end?.id;
    const startTime = dto.startTime ? new Date(dto.startTime) : domain.startTime;

    const fixedDto = omit(
      { ...dto },
      ['startId', 'endId', 'startTime']);

    return Promise.all([this.getPlace(startId), this.getPlace(endId)]).then(([start, end]) => {
      const ret = {
        ...domain,
        ...fixedDto,
        start,
        end,
        startTime,
      } as Job;

      return ret;
    });
  }

  getPlace(id: string) {
    return id ? this.service.findOne(id) : null;
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
  imports: [PlacesModule, TypeOrmModule.forFeature([Job]), AuthenticationModule],
  controllers: [JobsController],
  providers: [JobsService, JobMapper, JobRepository],
  exports: [JobsService, JobMapper],
})
export class JobsModule {}