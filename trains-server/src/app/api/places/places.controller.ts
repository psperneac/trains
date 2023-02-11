import { Controller, UseFilters } from '@nestjs/common';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { PlacesService } from './places.service';
import { PlaceDto } from '../../../models/place.model';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import Place from './place.entity';
import { PlaceMapper } from './place.mapper';
import { AbstractService } from '../../../utils/abstract.service';
import { Mapper } from '../../../utils/mapper';

@Controller('places')
@UseFilters(AllExceptionsFilter)
export class PlacesController extends AbstractServiceController<Place, PlaceDto> {
  constructor(private readonly placesService: PlacesService, private readonly placesMapper: PlaceMapper) {
    super();
  }

  public getService(): AbstractService<Place> {
    return this.placesService;
  }
  public getMapper(): Mapper<Place, PlaceDto> {
    return this.placesMapper;
  }
}
