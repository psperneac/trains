import { Controller, UseFilters } from '@nestjs/common';
import { VehicleTypeFeatureService } from "./vehicle-type-feature.service";
import { VehicleTypeDto } from './dto/vehicle-type.dto';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { VehicleType } from './entities/vehicle-type.entity';

@Controller('vehicle-types')
@UseFilters(AllExceptionsFilter)
export class VehicleTypeController extends AbstractServiceController<VehicleType, VehicleTypeDto> {
  constructor(private feature: VehicleTypeFeatureService) {
    super(feature);
  }
}
