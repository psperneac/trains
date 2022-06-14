import { Injectable } from '@nestjs/common';
import { VehicleTypeDto } from './dto/vehicle-type.dto';

@Injectable()
export class VehicleTypeService {
  create(createVehicleTypeDto: VehicleTypeDto) {
    return 'This action adds a new vehicleType';
  }

  findAll() {
    return `This action returns all vehicleType`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vehicleType`;
  }

  update(id: number, updateVehicleTypeDto: VehicleTypeDto) {
    return `This action updates a #${id} vehicleType`;
  }

  remove(id: number) {
    return `This action removes a #${id} vehicleType`;
  }
}
