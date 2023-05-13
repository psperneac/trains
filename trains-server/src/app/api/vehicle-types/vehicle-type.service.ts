import { Injectable } from '@nestjs/common';
import { VehicleTypeDto } from "./dto/vehicle-type.dto";

import { VehicleType } from './entities/vehicle-type.entity';
import { AbstractService } from '../../../utils/abstract.service';
import { VehicleTypeFeatureService } from "./vehicle-type-feature.service";

@Injectable()
export class VehicleTypeService extends AbstractService<VehicleType, VehicleTypeDto> {
  constructor(
    private readonly feature: VehicleTypeFeatureService,
  ) {
    super(feature);
  }
}
