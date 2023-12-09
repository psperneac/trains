import { TestConfig } from '../../../utils/test/test-config';
import { Vehicle, VehicleDto } from './vehicle.entity';
import { VehicleController, VehicleMapper, VehicleRepository, VehiclesService } from './vehicle.module';

const createVehicle = (id: number): Vehicle => {
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
    engineMax: 100,
    engineLoad: 100,
    engineFuel: 100,
    auxMax: 100,
    auxLoad: 100,
    auxFuel: 100,
    speed: 100,
  };
};

export const VehicleTestConfig: TestConfig<Vehicle, VehicleDto> = {
  name: 'Vehicles',
  url: '/vehicles',

  createEntity: createVehicle,
  createUpdateDto: function (id: number): Partial<VehicleDto> {
    return {
      id: 'ID' + id,
      name: 'UpdateVehicle' + id,
      description: 'UpdatedVehicleDescription' + id,
    };
  },
  createPatchDto: function (id: number): Partial<VehicleDto> {
    return {
      name: 'UpdateVehicle' + id,
      description: 'UpdatedVehicleDescription' + id,
    };
  },
  data: [
    createVehicle(1),
    createVehicle(2),
    createVehicle(3),
    createVehicle(4),
    createVehicle(5),
    createVehicle(6),
    createVehicle(7),
    createVehicle(8),
    createVehicle(9),
  ],

  newEntityId: 10,
  existingEntityId: 4,

  entityClass: Vehicle,
  controllerClass: VehicleController,
  mapperClass: VehicleMapper,
  serviceClass: VehiclesService,
  repositoryAccessorClass: VehicleRepository,
};
