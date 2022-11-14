import { Injectable } from '@nestjs/common';
import { assign } from 'lodash';

import { PlaceTypeDto } from './dto/place-type.dto';
import { PlaceType } from './entities/place-type.entity';

@Injectable()
export class PlaceTypeMapper {
  toDto(placeType: PlaceType): PlaceTypeDto {
    return {
      id: placeType.id,
      name: placeType.name,
      description: placeType.description,
    } as PlaceTypeDto;
  }

  toDomain(dto: PlaceTypeDto, placeType?: PlaceType): PlaceType {
    const ret = {
      ...placeType
    };

    assign(ret, {
      ...dto,
    });

    return ret;
  }
}