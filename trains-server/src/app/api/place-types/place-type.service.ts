import { Injectable } from '@nestjs/common';
import { AbstractService } from '../../../utils/abstract.service';
import { PlaceTypeDto } from "./dto/place-type.dto";
import { PlaceType } from './entities/place-type.entity';
import { PlaceTypeFeatureService } from "./place-type-feature.service";

@Injectable()
export class PlaceTypeService extends AbstractService<PlaceType, PlaceTypeDto> {
  constructor(private feature: PlaceTypeFeatureService) {
    super(feature);
  }
}
