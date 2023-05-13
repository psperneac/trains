import { Injectable } from '@nestjs/common';
import { PlaceDto } from "../../../models/place.model";
import { PlaceFeatureService } from "./place-feature.service";
import Place from './place.entity';
import { AbstractService } from '../../../utils/abstract.service';

@Injectable()
export class PlacesService extends AbstractService<Place, PlaceDto> {
  constructor(private feature: PlaceFeatureService) {
    super(feature);
  }
}
