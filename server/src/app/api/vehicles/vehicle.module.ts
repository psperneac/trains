import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';

import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';

import { Vehicle, VehicleDto } from './vehicle.entity';

@Injectable()
export class VehicleRepository extends RepositoryAccessor<Vehicle> {
  constructor(@InjectRepository(Vehicle) private readonly injectedRepository) {
    super(injectedRepository);
  }
}

@Injectable()
export class VehiclesService extends AbstractService<Vehicle> {
  constructor(private readonly repo: VehicleRepository) {
    super(repo);
  }
}

@Injectable()
export class VehicleMapper extends AbstractDtoMapper<Vehicle, VehicleDto> {
  getMappedProperties(): string[] {
    return [
      'id',
      'type',
      'name',
      'description',
      'content',
      'engineMax',
      'engineLoad',
      'engineFuel',
      'auxMax',
      'auxLoad',
      'auxFuel',
      'speed'
    ];
  }
}

@Controller('vehicles')
@UseFilters(AllExceptionsFilter)
export class VehicleController extends AbstractServiceController<Vehicle, VehicleDto> {
  constructor(service: VehiclesService, mapper: VehicleMapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle])],
  controllers: [VehicleController],
  providers: [VehicleMapper, VehiclesService, VehicleRepository],
  exports: [VehicleMapper, VehiclesService]
})
export class VehicleModule {}
