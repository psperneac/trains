import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { PlaceType, PlaceTypeDto } from './place-type.entity';

@Injectable()
export class PlaceTypeRepository extends RepositoryAccessor<PlaceType> {
  constructor(@InjectRepository(PlaceType) injectedRepository) {
    super(injectedRepository);
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
  imports: [TypeOrmModule.forFeature([PlaceType])],
  controllers: [PlaceTypeController],
  providers: [PlaceTypeService, PlaceTypeMapper, PlaceTypeRepository],
  exports: [PlaceTypeService, PlaceTypeMapper]
})
export class PlaceTypeModule {}
