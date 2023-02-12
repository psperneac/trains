import { Injectable } from '@nestjs/common';
import { assign } from 'lodash';

import { VehicleTypeDto } from './dto/vehicle-type.dto';
import { VehicleType } from './entities/vehicle-type.entity';

@Injectable()
export class VehicleTypeMapper {
  toDto(vehicleType: VehicleType): VehicleTypeDto {
    if (!vehicleType) {
      return null;
    }

    return {
      id: vehicleType.id,
      name: vehicleType.name,
      description: vehicleType.description,
    } as VehicleTypeDto;
  }

  toDomain(dto: VehicleTypeDto, vehicleType?: VehicleType): VehicleType {
    const ret = {
      ...vehicleType,
    };

    assign(ret, {
      ...dto,
    });

    return ret;
  }
}