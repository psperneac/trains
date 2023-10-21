import { TestConfig } from '../../../utils/test/test-config';
import { Place, PlaceDto } from './place.entity';
import { PlaceMapper, PlacesController, PlacesRepository, PlacesService } from './places.module';

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
    long: 120.77 + id / 7
  };
};

export const PlaceTestConfig: TestConfig<Place, PlaceDto> = {
  name: 'Places',
  url: '/places',

  createEntity: createPlace,
  createUpdateDto: function (id: number): Partial<PlaceDto> {
    return {
      id: 'ID' + id,
      name: 'UpdatedPlace' + id,
      description: 'UpdatedPlaceDescription' + id
    };
  },
  createPatchDto: function (id: number): Partial<PlaceDto> {
    return {
      name: 'PatchedPlace' + id,
      description: 'PatchedPlaceDescription' + id
    };
  },

  data: [
    createPlace(1),
    createPlace(2),
    createPlace(3),
    createPlace(4),
    createPlace(5),
    createPlace(6),
    createPlace(7),
    createPlace(8),
    createPlace(9)
  ],

  newEntityId: 10,
  existingEntityId: 4,

  entityClass: Place,
  controllerClass: PlacesController,
  mapperClass: PlaceMapper,
  serviceClass: PlacesService,
  repositoryAccessorClass: PlacesRepository
};
