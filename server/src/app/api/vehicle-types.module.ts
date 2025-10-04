import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { Types } from 'mongoose';
import { Repository } from 'typeorm';

import { AbstractDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractEntity } from '../../utils/abstract.entity';
import { AbstractServiceController } from '../../utils/abstract-service.controller';
import { AbstractService } from '../../utils/abstract.service';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { MockRepository } from '../../utils/mocks/repository.mock';
import { RepositoryAccessor } from '../../utils/repository-accessor';

export class VehicleType extends AbstractEntity {
  type: string;
  name: string;
  description: string;
  content: any;
}

export class VehicleTypeDto {
  id: string;
  type: string;
  name: string;
  description: string;
  content: any;
}

/*

682be65aeffcff2be10510d9
682be65aeffcff2be10510da
682be65aeffcff2be10510db
682be65aeffcff2be10510dc
682be65aeffcff2be10510dd

*/
const VEHICLE_TYPE_DATE: VehicleType[] = [
  { _id: new Types.ObjectId('682be65aeffcff2be10510d3'), type: 'TRUCK', name: 'Truck', description: 'Carries freight by road', content: {} } as any as VehicleType,
  { _id: new Types.ObjectId('682be65aeffcff2be10510d4'), type: 'SHIP', name: 'Ship', description: 'Goes on water, carries a lot', content: {} } as any as VehicleType,
  {
    _id: new Types.ObjectId('682be65aeffcff2be10510d5'),
    type: 'TRAIN',
    name: 'Train',
    description: 'A vehicle that runs on tracks',
    content: {}
  } as any as VehicleType,
  { _id: new Types.ObjectId('682be65aeffcff2be10510d6'), type: 'CAR', name: 'Car', description: 'Small road vehicle', content: {} } as any as VehicleType,
  { _id: new Types.ObjectId('682be65aeffcff2be10510d7'), type: 'BUS', name: 'Bus', description: 'Mass transit vehicle', content: {} } as any as VehicleType,
  { _id: new Types.ObjectId('682be65aeffcff2be10510d8'), type: 'PLANE', name: 'Plane', description: 'Flies in the air', content: {} } as any as VehicleType
];

@Injectable()
export class VehicleTypeRepository extends RepositoryAccessor<VehicleType> {
  constructor() {
    super(new MockRepository(VEHICLE_TYPE_DATE) as any as Repository<VehicleType>);
  }
}

@Injectable()
export class VehicleTypeService extends AbstractService<VehicleType> {
  constructor(private readonly repoAccessor: VehicleTypeRepository) {
    super(repoAccessor);
  }
}

@Injectable()
export class VehicleTypeMapper extends AbstractDtoMapper<VehicleType, VehicleTypeDto> {
  getMappedProperties(): string[] {
    return ['id', 'type', 'name', 'description', 'content'];
  }
}

@Controller('vehicle-types')
@UseFilters(AllExceptionsFilter)
export class VehicleTypeController extends AbstractServiceController<VehicleType, VehicleTypeDto> {
  constructor(service: VehicleTypeService, mapper: VehicleTypeMapper) {
    super(service, mapper);
  }
}

@Module({
  controllers: [VehicleTypeController],
  providers: [VehicleTypeService, VehicleTypeMapper, VehicleTypeRepository],
  exports: [VehicleTypeService, VehicleTypeMapper]
})
export class VehicleTypesModule {}
