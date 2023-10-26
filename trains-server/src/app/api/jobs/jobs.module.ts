import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { omit } from 'lodash';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractService } from '../../../utils/abstract.service';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { PlacesService } from '../places/places.module';
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
      startTime: domain.startTime,
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

    const fixedDto = omit(
      { ...dto },
      ['startId', 'endId']);

    return Promise.all([this.getPlace(startId), this.getPlace(endId)]).then(([start, end]) => {
      return {
        ...domain,
        ...fixedDto,
        start,
        end
      } as Job;
    });
  }

  getPlace(id: string) {
    return id ? this.service.findOne(id) : null;
  }
}