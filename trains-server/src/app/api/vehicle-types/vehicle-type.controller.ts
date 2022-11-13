import { Controller, UseFilters } from '@nestjs/common';
import { VehicleTypeService } from './vehicle-type.service';
import { VehicleTypeDto } from './dto/vehicle-type.dto';
import { VehicleTypeMapper } from './vehicle-type.mapper';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { VehicleType } from './entities/vehicle-type.entity';
import { AbstractService } from '../../../utils/abstract.service';
import { Mapper } from '../../../utils/mapper';

@Controller('vehicle-types')
@UseFilters(AllExceptionsFilter)
export class VehicleTypeController extends AbstractServiceController<VehicleType, VehicleTypeDto> {
  constructor(private readonly service: VehicleTypeService, private readonly mapper: VehicleTypeMapper) {
    super();
  }

  public getService(): AbstractService<VehicleType> {
    return this.service;
  }
  public getMapper(): Mapper<VehicleType, VehicleTypeDto> {
    return this.mapper;
  }
}
