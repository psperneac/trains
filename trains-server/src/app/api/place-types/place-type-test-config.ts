import { TestConfig } from '../../../utils/test/test-config';
import { PlaceTypeDto } from './dto/place-type.dto';
import { PlaceType } from './entities/place-type.entity';
import { PlaceTypeController } from './place-type.controller';
import { PlaceTypeMapper } from './place-type.mapper';
import { PlaceTypeService } from './place-type.service';

const createPlaceType = (id: number): PlaceType => {
  return {
    id: 'ID' + id,
    version: 0,
    created: new Date(),
    updated: new Date(),
    deleted: null,
    type: 'TYPE' + id,
    name: 'NAME' + id,
    description: 'DESCRIPTION' + id,
  };
}

export const PlaceTypeTestConfig: TestConfig<PlaceType, PlaceTypeDto> = {
  name: 'PlaceTypes',
  url: '/place-types',

  createEntity: createPlaceType,
  createUpdateDto: function (id: number): Partial<PlaceTypeDto> {
    return {
      id: 'ID' + id,
      name: 'UpdatePlaceType' + id,
      description: 'UpdatedPlaceTypeDescription' + id,
    };
  },
  createPatchDto: function (id: number): Partial<PlaceTypeDto> {
    return {
      name: 'UpdatePlaceType' + id,
      description: 'UpdatedPlaceTypeDescription' + id,
    };
  },
  data: [
    createPlaceType(1),
    createPlaceType(2),
    createPlaceType(3),
    createPlaceType(4),
    createPlaceType(5),
    createPlaceType(6),
    createPlaceType(7),
    createPlaceType(8),
    createPlaceType(9),
  ],

  newEntityId: 10,
  existingEntityId: 4,

  entityClass: PlaceType,
  controllerClass: PlaceTypeController,
  mapperClass: PlaceTypeMapper,
  serviceClass: PlaceTypeService,
};
