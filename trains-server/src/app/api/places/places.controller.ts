import { Controller, UseFilters } from '@nestjs/common';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { PlaceFeatureService } from "./place-feature.service";
import { PlaceDto } from '../../../models/place.model';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import Place from './place.entity';

@Controller('places')
@UseFilters(AllExceptionsFilter)
export class PlacesController extends AbstractServiceController<Place, PlaceDto> {
  constructor(private feature: PlaceFeatureService) {
    super(feature);
  }
}
