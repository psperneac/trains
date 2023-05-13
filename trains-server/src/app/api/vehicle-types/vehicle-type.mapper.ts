import { Injectable } from '@nestjs/common';
import { AbstractDtoMapper } from "../../../utils/abstract-dto-mapper";

import { VehicleTypeDto } from './dto/vehicle-type.dto';
import { VehicleType } from './entities/vehicle-type.entity';
import { VehicleTypeFeatureService } from "./vehicle-type-feature.service";

@Injectable()
export class VehicleTypeMapper extends AbstractDtoMapper<VehicleType, VehicleTypeDto> {
  constructor(private feature: VehicleTypeFeatureService) {
    super(feature);
  }
}