import { TestConfig } from '../../../utils/test/test-config';
import { VehicleType, VehicleTypeDto } from './vehicle-type.entity';
import { VehicleTypeController, VehicleTypeMapper, VehicleTypeRepository, VehicleTypeService } from './vehicle-types.module';

const createVehicleType = (id: number): VehicleType => {
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
  };
};

export const VehicleTypeTestConfig: TestConfig<VehicleType, VehicleTypeDto> = {
  name: 'VehicleTypes',
  url: '/vehicle-types',

  createEntity: createVehicleType,
  createUpdateDto: function (id: number): Partial<VehicleTypeDto> {
    return {
      id: 'ID' + id,
      name: 'UpdateVehicleType' + id,
      description: 'UpdatedVehicleTypeDescription' + id,
    };
  },
  createPatchDto: function (id: number): Partial<VehicleTypeDto> {
    return {
      name: 'UpdateVehicleType' + id,
      description: 'UpdatedVehicleTypeDescription' + id,
    };
  },
  data: [
    createVehicleType(1),
    createVehicleType(2),
    createVehicleType(3),
    createVehicleType(4),
    createVehicleType(5),
    createVehicleType(6),
    createVehicleType(7),
    createVehicleType(8),
    createVehicleType(9),
  ],

  newEntityId: 10,
  existingEntityId: 4,

  entityClass: VehicleType,
  controllerClass: VehicleTypeController,
  mapperClass: VehicleTypeMapper,
  serviceClass: VehicleTypeService,
  repositoryAccessor: VehicleTypeRepository,
};
