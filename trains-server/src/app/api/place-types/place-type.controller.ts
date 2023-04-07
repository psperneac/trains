import { Controller, UseFilters } from '@nestjs/common';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { PlaceTypeService } from './place-type.service';
import { PlaceTypeMapper } from './place-type.mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { PlaceType } from './entities/place-type.entity';
import { AbstractService } from '../../../utils/abstract.service';
import { Mapper } from '../../../utils/mapper';
import { PlaceTypeDto } from './dto/place-type.dto';

@Controller('place-types')
@UseFilters(AllExceptionsFilter)
export class PlaceTypeController extends AbstractServiceController<PlaceType, PlaceTypeDto> {
  constructor(private readonly service: PlaceTypeService, private readonly mapper: PlaceTypeMapper) {
    super();
  }

  public getService(): AbstractService<PlaceType> {
    return this.service;
  }
  public getMapper(): Mapper<PlaceType, PlaceTypeDto> {
    return this.mapper;
  }
}
