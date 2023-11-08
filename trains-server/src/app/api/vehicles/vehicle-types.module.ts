import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { MockRepository } from '../../../utils/mocks/repository.mock';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { VehicleType, VehicleTypeDto } from './vehicle-type.entity';

const VEHICLE_TYPE_DATE: VehicleType[] = [
  { id: 'TRUCK', type: 'TRUCK', name: 'Truck', description: 'Carries freight by road', content: {}} as VehicleType,
  { id: 'SHIP', type: 'SHIP', name: 'Ship', description: 'Goes on water, carries a lot', content: {}} as VehicleType,
  { id: 'TRAIN', type: 'TRAIN', name: 'Train', description: 'A vehicle that runs on tracks', content: {}} as VehicleType,
  { id: 'CAR', type: 'CAR', name: 'Car', description: 'Small road vehicle', content: {}} as VehicleType,
  { id: 'BUS', type: 'BUS', name: 'Bus', description: 'Mass transit vehicle', content: {}} as VehicleType,
  { id: 'PLANE', type: 'PLANE', name: 'Plane', description: 'Flies in the air', content: {}} as VehicleType
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
  exports: [VehicleTypeService, VehicleTypeMapper],
})
export class VehicleTypesModule {}
