import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { assign } from "lodash";
import { AuthenticationModule } from '../../../authentication/authentication.module';
import { AbstractDtoMapper } from "../../../utils/abstract-dto-mapper";
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { CreatePlaceDto, Place, PlaceDto, UpdatePlaceDto } from './place.entity';

@Injectable()
export class PlaceRepository extends RepositoryAccessor<Place> {
  constructor(@InjectRepository(Place) injectRepository) {
    super(injectRepository);
  }
}

@Injectable()
export class PlaceMapper extends AbstractDtoMapper<Place, PlaceDto > {
  getMappedProperties(): string[] {
    return ['id', 'name', 'description', 'type', 'lat', 'long'];
  }
}

@Injectable()
export class PlacesService extends AbstractService<Place> {
  constructor(repo: PlaceRepository) {
    super(repo);
  }
}

@Controller('places')
@UseFilters(AllExceptionsFilter)
export class PlacesController extends AbstractServiceController<Place, PlaceDto> {
  constructor(service: PlacesService, mapper: PlaceMapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Place]), AuthenticationModule],
  controllers: [PlacesController],
  providers: [PlacesService, PlaceMapper, PlaceRepository],
  exports: [PlacesService, PlaceMapper],
})
export class PlacesModule {}
