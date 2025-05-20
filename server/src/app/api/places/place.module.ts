import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { Entity, Column } from 'typeorm';

import { AuthenticationModule } from '../../../authentication/authentication.module';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';

@Entity({ name: 'places' })
export class Place extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  type: string;

  @Column()
  lat: number;

  @Column()
  lng: number;
}

export interface PlaceDto {
  id: string;
  name: string;
  description: string;
  type: string;
  lat: number;
  lng: number;
}

@Injectable()
export class PlacesRepository extends RepositoryAccessor<Place> {
  constructor(@InjectRepository(Place) injectRepository) {
    super(injectRepository);
  }
}

@Injectable()
export class PlaceMapper extends AbstractDtoMapper<Place, PlaceDto> {
  getMappedProperties(): string[] {
    return ['id', 'name', 'description', 'type', 'lat', 'lng'];
  }
}

@Injectable()
export class PlacesService extends AbstractService<Place> {
  constructor(repo: PlacesRepository) {
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
  providers: [PlacesService, PlaceMapper, PlacesRepository],
  exports: [PlacesService, PlaceMapper]
})
export class PlacesModule {}
