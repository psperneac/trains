import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { AbstractDtoMapper } from "../../../utils/abstract-dto-mapper";
import { AbstractServiceController } from "../../../utils/abstract-service.controller";
import { AbstractService } from "../../../utils/abstract.service";
import { AllExceptionsFilter } from "../../../utils/all-exceptions.filter";
import { RepositoryAccessor } from "../../../utils/repository-accessor";
import { VehicleType, VehicleTypeDto } from './vehicle-type.entity';

@Injectable()
export class VehicleTypeRepository extends RepositoryAccessor<VehicleType> {
  constructor(@InjectRepository(VehicleType) private readonly injectedRepository) {
    super(injectedRepository);
  }
}

@Injectable()
export class VehicleTypeService extends AbstractService<VehicleType, VehicleTypeDto> {
  constructor(private readonly repo: VehicleTypeRepository) {
    super(repo);
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
  imports: [TypeOrmModule.forFeature([VehicleType])],
  controllers: [VehicleTypeController],
  providers: [VehicleTypeService, VehicleTypeMapper, VehicleTypeRepository],
  exports: [VehicleTypeService, VehicleTypeMapper],
})
export class VehicleTypesModule {}
