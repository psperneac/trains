import { Injectable } from '@nestjs/common';
import { assign } from 'lodash';
import { AbstractDtoMapper } from "../../../utils/abstract-dto-mapper";

import { PlaceTypeDto } from './dto/place-type.dto';
import { PlaceType } from './entities/place-type.entity';

@Injectable()
export class PlaceTypeMapper extends AbstractDtoMapper<PlaceType, PlaceTypeDto> {
  toDto(placeType: PlaceType): PlaceTypeDto {
    if (!placeType) {
      return null;
    }

    return {
      id: placeType.id,
      name: placeType.name,
      type: placeType.type,
      description: placeType.description,
      content: placeType.content,
    } as PlaceTypeDto;
  }
}
