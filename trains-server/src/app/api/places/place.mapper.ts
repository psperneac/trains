import { Injectable } from '@nestjs/common';
import {
  CreatePlaceDto,
  PlaceDto,
  UpdatePlaceDto,
} from '../../../models/place.model';
import Place from './place.entity';
import { assign } from 'lodash';

@Injectable()
export class PlaceMapper {
  toDto(place: Place): PlaceDto {
    return {
      id: place.id,
      name: place.name,
      description: place.description,
      type: place.type,
      lat: place.lat,
      long: place.long,
    };
  }

  toDomain(
    dto: PlaceDto | CreatePlaceDto | UpdatePlaceDto,
    place?: Place,
  ): Place {
    const ret = {
      ...place,
    };

    assign(ret, dto);

    return ret;
  }
}
