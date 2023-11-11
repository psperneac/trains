import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestConfig } from '../../../utils/test/test-config';
import { Place } from './place.entity';
import { PlaceConnection, PlaceConnectionDto } from './place-connection.entity';
import {
  PlaceConnectionMapper,
  PlaceConnectionService,
  PlaceConnectionController,
  PlaceConnectionRepository
} from './place-connection.module';
import { MockRepository } from '../../../utils/mocks/repository.mock';
import { RepositoryAccessor } from '../../../utils/repository-accessor';

const createPlace = (id: number): Place => {
  return {
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
  };
};

const createPlaceConnection = (id: number): PlaceConnection => {
  return {
    id: 'ID' + id,
    version: 0,
    created: new Date(),
    updated: new Date(),
    deleted: null,
    type: 'TYPE' + id,
    name: 'NAME' + id,
    description: 'DESCRIPTION' + id,
    content: {},
    start: createPlace(id),
    end: createPlace(10 - id)
  };
};

const DATA = [
  createPlaceConnection(1),
  createPlaceConnection(2),
  createPlaceConnection(3),
  createPlaceConnection(4),
  createPlaceConnection(5),
  createPlaceConnection(6),
  createPlaceConnection(7),
  createPlaceConnection(8),
  createPlaceConnection(9)
];

export const PlaceConnectionTestConfig: TestConfig<PlaceConnection, PlaceConnectionDto> = {
  name: 'PlaceConnections',
  url: '/place-connections',

  createEntity: createPlaceConnection,
  createUpdateDto: function (id: number): Partial<PlaceConnectionDto> {
    return {
      id: 'ID' + id,
      name: 'UpdatePlaceConnection' + id,
      description: 'UpdatedPlaceConnectionDescription' + id
    };
  },
  createPatchDto: function (id: number): Partial<PlaceConnectionDto> {
    return {
      name: 'UpdatePlaceConnection' + id,
      description: 'UpdatedPlaceConnectionDescription' + id
    };
  },
  data: [...DATA],

  newEntityId: 10,
  existingEntityId: 4,

  entityClass: PlaceConnection,
  controllerClass: PlaceConnectionController,
  mapperClass: PlaceConnectionMapper,
  serviceClass: PlaceConnectionService,
  repositoryAccessorClass: PlaceConnectionRepository,

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
    const accessor = new RepositoryAccessor<PlaceConnection>(repo as any as Repository<PlaceConnection>, null);

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
