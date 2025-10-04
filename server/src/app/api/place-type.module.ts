import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { Types } from 'mongoose';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { Repository } from 'typeorm';

import { AbstractDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../utils/abstract-service.controller';
import { AbstractService } from '../../utils/abstract.service';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { MockRepository } from '../../utils/mocks/repository.mock';
import { RepositoryAccessor } from '../../utils/repository-accessor';

export class PlaceType extends AbstractEntity {
  type: string;
  name: string;
  description: string;
  content: any;
}

export class PlaceTypeDto {
  id: string;
  type: string;
  name: string;
  description: string;
  content: any;
}

/*

682be65aeffcff2be10510e4
682be65aeffcff2be10510e5
682be65aeffcff2be10510e6

*/

export const PLACE_TYPE_DATA: PlaceType[] = [
  {
    _id: new Types.ObjectId('682be65aeffcff2be10510de'),
    type: 'RAIL',
    name: 'Railway station',
    description: 'Railway station',
    content: {}
  } as any as PlaceType,
  {
    _id: new Types.ObjectId('682be65aeffcff2be10510df'),
    type: 'WAREHOUSE',
    name: 'Warehouse',
    description: 'Warehouse',
    content: {}
  } as any as PlaceType,
  {
    _id: new Types.ObjectId('682be65aeffcff2be10510e0'),
    type: 'PORT',
    name: 'Port',
    description: 'Port',
    content: {}
  } as any as PlaceType,
  {
    _id: new Types.ObjectId('682be65aeffcff2be10510e1'),
    type: 'BUSINESS',
    name: 'Business',
    description: 'A business place',
    content: {}
  } as any as PlaceType,
  {
    _id: new Types.ObjectId('682be65aeffcff2be10510e2'),
    type: 'TRANSIT',
    name: 'Transit Station',
    description: 'Mass Transit Station',
    content: {}
  } as any as PlaceType,
  {
    _id: new Types.ObjectId('682be65aeffcff2be10510e3'),
    type: 'YARD',
    name: 'Yard',
    description: 'Vehicle, Train, Mass Transit or Shipyard',
    content: {}
  } as any as PlaceType,
  {
    _id: new Types.ObjectId('683bd04be7cc7a6c65087ab0'),
    type: 'RESIDENCE',
    name: 'Residence',
    description: 'A private residence',
    content: {}
  } as any as PlaceType
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
