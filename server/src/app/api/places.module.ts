import { Controller, Get, Injectable, Module, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity } from 'typeorm';

import { AuthenticationModule } from '../../authentication/authentication.module';
import { LoggedIn } from '../../authentication/authentication.guard';
import { PageDto } from '../../models/page.model';
import { PageRequestDto } from '../../models/pagination.model';
import { AbstractDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../utils/abstract-service.controller';
import { AbstractService } from '../../utils/abstract.service';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../utils/repository-accessor';
import { GamesModule } from './games.module';
import { Expose } from 'class-transformer';

@Entity({ name: 'places' })
export class Place extends AbstractEntity {
  @Column()
  @Expose()
  name: string;

  @Column()
  @Expose()
  description: string;

  @Column()
  @Expose()
  type: string;

  @Column()
  @Expose()
  lat: number;

  @Column()
  @Expose()
  lng: number;

  @Column()
  @Expose()
  gameId: string;
}

export interface PlaceDto {
  id: string;
  name: string;
  description: string;
  type: string;
  lat: number;
  lng: number;
  gameId: string;
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
    return ['id', 'name', 'description', 'type', 'lat', 'lng', 'gameId'];
  }
}

@Injectable()
export class PlacesService extends AbstractService<Place> {
  constructor(private readonly repo: PlacesRepository) {
    super(repo);
  }

  async findByGameId(gameId: string, pagination?: PageRequestDto): Promise<PageDto<Place>> {
    return this.findAllWhere({ gameId }, pagination);
  }
}

@Controller('places')
@UseFilters(AllExceptionsFilter)
export class PlacesController extends AbstractServiceController<Place, PlaceDto> {
  constructor(
    private readonly placesService: PlacesService,
    private readonly placeMapper: PlaceMapper
  ) {
    super(placesService, placeMapper);
  }

  @Get('game/:gameId')
  @UseGuards(LoggedIn)
  async findByGameId(
    @Param('gameId') gameId: string,
    @Query() pagination: PageRequestDto
  ): Promise<PageDto<PlaceDto>> {
    const page = await this.placesService.findByGameId(gameId, pagination);
    return this.handlePagedResults(page, this.placeMapper);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Place]), AuthenticationModule, GamesModule],
  controllers: [PlacesController],
  providers: [PlacesService, PlaceMapper, PlacesRepository],
  exports: [PlacesService, PlaceMapper]
})
export class PlacesModule {}
