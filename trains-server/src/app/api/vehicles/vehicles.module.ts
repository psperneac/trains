import { Controller, Injectable, Module, OnModuleInit, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { AbstractDtoMapper, Mapper } from "../../../utils/abstract-dto-mapper";
import { AbstractServiceController } from "../../../utils/abstract-service.controller";
import { AbstractService } from "../../../utils/abstract.service";
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from "../../../utils/repository-accessor";
import { Vehicle, VehicleDto } from "./vehicle.entity";

@Injectable()
export class VehicleRepository extends RepositoryAccessor<Vehicle> {
  constructor(@InjectRepository(Vehicle) injectedRepository) {
    super(injectedRepository);
  }
}

@Injectable()
export class VehicleService extends AbstractService<Vehicle, VehicleDto> {
  constructor(repo: VehicleRepository) {
    super(repo);
  }
}

@Injectable()
export class VehicleMapper extends AbstractDtoMapper<Vehicle, VehicleDto> {
  getMappedProperties(): string[] {
    return [
      'id', 'type', 'name', 'description', 'content',
      'engineMax', 'engineLoad', 'engineFuel',
      'auxMax', 'auxLoad', 'auxFuel',
      'speed'
    ];
  }
}

@Controller('vehicles')
@UseFilters(AllExceptionsFilter)
export class VehicleController extends AbstractServiceController<Vehicle, VehicleDto> {
  constructor(service: VehicleService, mapper: VehicleMapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle])],
  controllers: [VehicleController],
  providers: [VehicleMapper, VehicleService, VehicleRepository],
  exports: [VehicleMapper, VehicleService]
})
export class VehiclesModule {}

