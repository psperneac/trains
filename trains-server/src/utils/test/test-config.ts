import { AbstractServiceController } from '../abstract-service.controller';
import { AbstractService } from '../abstract.service';
import { AbstractMapper } from '../abstract.mapper';

/** config class to be used in abstract controller test */
export interface TestConfig<T, R> {
  /** name to be displayed in test */
  name: string;
  /** url at which the entity's controller is served */
  url: string;

  /** method to produce a new entity with a number seed */
  createEntity: (id: number) => T;
  /** method to produce a new update dto with a number seed */
  createUpdateDto: (id: number) => Partial<R>;
  createPatchDto: (id: number) => Partial<R>;

  /** the class of the entity, used in setting up the test */
  entityClass: any;
  /** the class of the controller, used in setting up the test */
  controllerClass: any;
  /** the class of the mapper, used in setting up the test */
  mapperClass: any;
  /** the class of the service, used in setting up the test */
  serviceClass: any;

  /** data to be used in test */
  data: T[];

  /** controller created by nest */
  controller?: AbstractServiceController<T, R>;
  /** service created by nest */
  service?: AbstractService<T>;
  /** mapper created  by nest */
  mapper?: AbstractMapper<T, R>;
  /** repository created by nest */
  repository?: any;

  newEntityId: number;
  updateEntityId: number;
  patchEntityId: number;
}