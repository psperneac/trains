import { Test, TestingModule } from '@nestjs/testing';
import { VehicleTypeController } from './vehicle-type.controller';
import { VehicleTypeService } from './vehicle-type.service';

describe('VehicleTypeController', () => {
  let controller: VehicleTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleTypeController],
      providers: [VehicleTypeService],
    }).compile();

    controller = module.get<VehicleTypeController>(VehicleTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
