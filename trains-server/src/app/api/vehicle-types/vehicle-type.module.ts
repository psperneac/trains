import { Module } from '@nestjs/common';
import { VehicleTypeService } from './vehicle-type.service';
import { VehicleTypeController } from './vehicle-type.controller';
import { VehicleTypeMapper } from './vehicle-type.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleType } from './entities/vehicle-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleType])],
  controllers: [VehicleTypeController],
  providers: [VehicleTypeService, VehicleTypeMapper],
  exports: [VehicleTypeService, VehicleTypeMapper],
})
export class VehicleTypeModule {}
