import { Injectable } from '@nestjs/common';
import { assign } from 'lodash';

import { VehicleTypeDto } from './dto/vehicle-type.dto';
import { VehicleType } from './entities/vehicle-type.entity';
import { PlaceTypeDto } from '../place-types/dto/place-type.dto';

@Injectable()
export class VehicleTypeMapper {
  toDto(vehicleType: VehicleType): VehicleTypeDto {
    return {
      id: vehicleType.id,
      name: vehicleType.name,
      defaultName: vehicleType.defaultName,
      description: vehicleType.description,
      content: JSON.parse(vehicleType.content)
    } as VehicleTypeDto;
  }

  toDomain(dto: VehicleTypeDto, vehicleType?: VehicleType): VehicleType {
    const ret = {
      ...vehicleType
    };

    assign(ret, {
      ...dto,
      content: JSON.stringify(dto.content)
    });

    return ret;
  }
}