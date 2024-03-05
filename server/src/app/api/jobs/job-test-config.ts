import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockRepository } from '../../../utils/mocks/repository.mock';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { TestConfig } from '../../../utils/test/test-config';
import { MapPlace } from '../places/map-place.entity';
import { MapTemplate } from '../maps/map-template.entity';
import { PlaceConnection } from '../places/place-connection.entity';
import { Place } from '../places/place.entity';
import { PlaceTestConfig } from '../places/places-test-config';
import { VehicleInstanceJob } from '../vehicles/vehicle-instance-job.entity';
import { Job, JobDto } from './job.entity';
import { JobMapper, JobRepository, JobsController, JobsService } from './jobs.module';

const createPlace = (id: number): MapPlace => {
  const place = {
    id: 'ID' + id,
    version: 0,
    created: new Date(),
    updated: new Date(),
    deleted: null,
    name: 'Place' + id,
    description: 'PlaceDescription' + id,
    type: 'RAIL',
    lat: 47.38 + id / 10,
    lng: 120.77 + id / 7
  } as Place;

  const map = {
    id: 'MapID' + id,
    version: 0,
    created: new Date(),
    updated: new Date(),
    deleted: null,
    name: 'Map' + id,
    description: 'MapDescription' + id
  } as MapTemplate;

  return {
    id: 'ID' + id,
    version: 0,
    created: new Date(),
    updated: new Date(),
    deleted: null,
    place,
    map,
  } as MapPlace;
};

const createJob = (id: number): Job => {
  const job = new VehicleInstanceJob();
  job.id = 'ID' + id;
  job.name = 'Job' + id;
  job.description = 'JobDescription' + id;
  job.type = 'JobType' + id;
  job.load = 1000 + id;
  job.payType = 'JobPayType' + id;
  job.pay = 10000 + id;
  job.start = createPlace(id);
  job.end = createPlace(10 - id);
  job.startTime = new Date();
  job.content = { id: 'JobContent' + id };

  return job;
}

const DATA: Job[] = [
  createJob(1),
  createJob(2),
  createJob(3),
  createJob(4),
  createJob(5),
  createJob(6),
  createJob(7),
  createJob(8),
  createJob(9)
];

export const JobTestConfig: TestConfig<Job, JobDto> = {
  name: 'Jobs',
  url: '/jobs',

  createEntity: createJob,
  createUpdateDto: function (id: number): Partial<JobDto> {
    return {
      id: 'ID' + id,
      name: 'UpdateJob' + id,
      description: 'UpdatedJobDescription' + id
    };
  },
  createPatchDto: function (id: number): Partial<JobDto> {
    return {
      name: 'UpdateJob' + id,
      description: 'UpdatedJobDescription' + id
    };
  },
  data: [...DATA],

  newEntityId: 10,
  existingEntityId: 4,

  entityClass: Job,
  controllerClass: JobsController,
  mapperClass: JobMapper,
  serviceClass: JobsService,
  repositoryAccessorClass: JobRepository,

  extraProviders: [
    // uncomment when testing alone; needs Places
    // PlaceTestConfig.serviceClass,
    // PlaceTestConfig.repositoryAccessorClass,
    // {
    //   provide: getRepositoryToken(PlaceTestConfig.entityClass),
    //   useValue: new MockRepository(PlaceTestConfig.data)
    // }
  ],

  createProviders: (config: TestConfig<any, any>) => {
    // recreate repo with fresh clone of data
    const repo = new MockRepository([...config.data]);
    const accessor = new RepositoryAccessor<Job>(repo as any as Repository<Job>, null);

    const ret = [
      config.mapperClass,
      config.serviceClass,
      {
        provide: config.repositoryAccessorClass,
        useValue: accessor
      },
      {
        provide: getRepositoryToken(config.entityClass),
        useValue: repo
      },
      ...(config.extraProviders ?? [])
    ];

    return ret;
  }
};
