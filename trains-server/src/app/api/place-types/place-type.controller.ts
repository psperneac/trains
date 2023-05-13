import { Controller, UseFilters } from '@nestjs/common';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { PlaceTypeFeatureService } from "./place-type-feature.service";
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { PlaceType } from './entities/place-type.entity';
import { PlaceTypeDto } from './dto/place-type.dto';

@Controller('place-types')
@UseFilters(AllExceptionsFilter)
export class PlaceTypeController extends AbstractServiceController<PlaceType, PlaceTypeDto> {
  constructor(private feature: PlaceTypeFeatureService) {
    super(feature);
  }
}
