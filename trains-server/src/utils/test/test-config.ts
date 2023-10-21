import { AbstractServiceController } from '../abstract-service.controller';
import { AbstractService } from '../abstract.service';
import { AbstractMapper } from '../abstract.mapper';
import { AbstractEntity } from '../abstract.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository } from '../mocks/repository.mock';
import { Provider } from '@nestjs/common';
// import { RepositoryAccessor } from '../repository-accessor';

/** config class to be used in abstract controller test */
export interface TestConfig<T extends AbstractEntity, R> {
  /** name to be displayed in test */
  name: string;
  /** url at which the entity's controller is served */
  url: string;

  /** method to produce a new entity with a number seed */
  createEntity: (id: number) => T;
  /** method to produce a new update dto with a number seed */
  createUpdateDto: (id: number) => Partial<R>;
  /** method to produce a new patch dto with a number seed */
  createPatchDto: (id: number) => Partial<R>;

  /** the class of the entity, used in setting up the test */
  entityClass: any;
  /** the class of the controller, used in setting up the test */
  controllerClass: any;
  /** the class of the mapper, used in setting up the test */
  mapperClass: any;
  /** the class of the service, used in setting up the test */
  serviceClass: any;
  /** repository accessor */
  repositoryAccessorClass?: any;

  /** extra providers to install for a type */
  extraProviders?: any[];

  /** data to be used in test */
  data: T[];

  /** id of a new entity to be created using POST */
  newEntityId: number;
  /** id of an existing entity to be updated using PUT or PATCH and deleted via DELETE */
  existingEntityId: number;

  /** controller created by nest */
  controller?: AbstractServiceController<T, R>;
  /** service created by nest */
  service?: AbstractService<T>;
  /** mapper created  by nest */
  mapper?: AbstractMapper<T, R>;
  /** repository created by nest */
  repository?: any;

  createProviders?: (config: TestConfig<any, any>) => Provider[];
}

export const getTestProviders = (config: TestConfig<any, any>): Provider[] => {
  const ret = [
    config.mapperClass,
    config.serviceClass,
    config.repositoryAccessorClass,
    {
      provide: getRepositoryToken(config.entityClass),
      useValue: new MockRepository([...config.data]) // clone data because tests movify the array
    },
    ...(config.extraProviders ?? [])
  ];

  return ret;
};
