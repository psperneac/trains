import { Module } from '@nestjs/common';
import { VehicleTypeService } from './vehicle-type.service';
import { VehicleTypeController } from './vehicle-type.controller';

@Module({
  controllers: [VehicleTypeController],
  providers: [VehicleTypeService],
})
export class VehicleTypeModule {}
