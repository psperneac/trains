import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { MockRepository } from '../../../utils/mocks/repository.mock';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { PlaceType, PlaceTypeDto } from './place-type.entity';

export const PLACE_TYPE_DATA: PlaceType[] = [
  { id: 'RAIL', type: 'RAIL', name: 'Railway station', description: 'Railway station', content: {}} as PlaceType,
  { id: 'WAREHOUSE', type: 'WAREHOUSE', name: 'Warehouse', description: 'Warehouse', content: {}} as PlaceType,
  { id: 'PORT', type: 'PORT', name: 'Port', description: 'Port', content: {}} as PlaceType,
  { id: 'BUSINESS', type: 'BUSINESS', name: 'Business', description: 'A business place', content: {}} as PlaceType,
  { id: 'TRANSIT', type: 'TRANSIT', name: 'Transit Station', description: 'Mass Transit Station', content: {}} as PlaceType,
  { id: 'YARD', type: 'YARD', name: 'Yard', description: 'Vehicle, Train, Mass Transit or Shipyard', content: {}} as PlaceType
];

@Injectable()
export class PlaceTypeRepository extends RepositoryAccessor<PlaceType> {
  constructor() {
    super(new MockRepository(PLACE_TYPE_DATA) as any as Repository<PlaceType>);
  }
}

@Injectable()
export class PlaceTypeService extends AbstractService<PlaceType> {
  constructor(repo: PlaceTypeRepository) {
    super(repo);
  }
}

@Injectable()
export class PlaceTypeMapper extends AbstractDtoMapper<PlaceType, PlaceTypeDto> {
  getMappedProperties(): string[] {
    return ['id', 'type', 'name', 'description', 'content'];
  }
}

@Controller('place-types')
@UseFilters(AllExceptionsFilter)
export class PlaceTypeController extends AbstractServiceController<PlaceType, PlaceTypeDto> {
  constructor(service: PlaceTypeService, mapper: PlaceTypeMapper) {
    super(service, mapper);
  }
}

@Module({
  //imports: [TypeOrmModule.forFeature([PlaceType])],
  controllers: [PlaceTypeController],
  providers: [PlaceTypeService, PlaceTypeMapper, PlaceTypeRepository],
  exports: [PlaceTypeService, PlaceTypeMapper]
})
export class PlaceTypeModule {}
