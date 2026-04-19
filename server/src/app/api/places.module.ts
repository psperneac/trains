import { Controller, Delete, Get, Injectable, Module, Param, Post, Query, UseFilters, UseGuards, Body } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { AbstractEntity } from '../../utils/abstract.entity';
import { Column, Entity } from 'typeorm';
import { ObjectId } from 'mongodb';

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
import { Types } from 'mongoose';

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

  @Column('objectId')
  @Expose()
  gameId: ObjectId;

  @Column({ default: 1000 })
  @Expose()
  priceGold: number;

  @Column({ default: 0 })
  @Expose()
  priceGems: number;
}

export interface PlaceDto {
  id: string;
  name: string;
  description: string;
  type: string;
  lat: number;
  lng: number;
  gameId: string;
  priceGold: number;
  priceGems: number;
}

export class CopyPlacesDto {
  @Expose()
  sourceGameId: string;

  @Expose()
  targetGameId: string;

  @Expose()
  overwrite: boolean;
}

export class CopyResultDto {
  @Expose()
  copiedCount: number;

  @Expose()
  skippedCount: number;

  @Expose()
  overwrittenCount: number;

  @Expose()
  errorCount: number;
}

@Injectable()
export class PlacesRepository extends RepositoryAccessor<Place> {
  constructor(@InjectRepository(Place) injectRepository) {
    super(injectRepository);
  }
}

@Injectable()
export class PlaceMapper extends AbstractDtoMapper<Place, PlaceDto> {
  constructor() {
    super();
  }

  async toDto(domain: Place): Promise<PlaceDto> {
    if (!domain) {
      return null;
    }

    const dto: PlaceDto = {
      id: domain._id.toString(),
      name: domain.name,
      description: domain.description,
      type: domain.type,
      lat: domain.lat,
      lng: domain.lng,
      gameId: domain.gameId.toString(),
      priceGold: domain.priceGold ?? 1000,
      priceGems: domain.priceGems ?? 0,
    };

    return dto;
  }

  async toDomain(dto: PlaceDto, domain?: Partial<Place> | Place): Promise<Place> {
    if (!dto) {
      return domain as any as Place;
    }

    if (!domain) {
      domain = {};
    }

    const { gameId, ...fixedDto } = dto;

    return {
      ...domain,
      ...fixedDto,
      gameId: gameId ? new Types.ObjectId(gameId) : domain?.gameId,
    } as any as Place;
  }
}

@Injectable()
export class PlacesService extends AbstractService<Place> {
  constructor(private readonly repo: PlacesRepository) {
    super(repo);
  }

  async findByGameId(gameId: string, pagination?: PageRequestDto): Promise<PageDto<Place>> {
    return this.findAllWhere({ gameId: new Types.ObjectId(gameId) }, pagination);
  }

  async copyPlaces(sourceGameId: string, targetGameId: string, overwrite: boolean): Promise<CopyResultDto> {
    // Copies places from source game to target game.
    // Places are matched by name: if a place with the same name exists in target, it either gets
    // overwritten (with overwrite=true) or is skipped (with overwrite=false).
    // Errors are logged but do not stop the process.
    // Returns counts of places copied, overwritten, skipped, and failed.
    const repo = this.repo.getRepository();
    const sourcePlaces = await repo.find({ where: { gameId: new Types.ObjectId(sourceGameId) } });
    const targetPlaces = await repo.find({ where: { gameId: new Types.ObjectId(targetGameId) } });
    
    const targetPlacesByName = new Map(targetPlaces.map(p => [p.name, p]));

    let copiedCount = 0;
    let skippedCount = 0;
    let overwrittenCount = 0;
    let errorCount = 0;

    for (const place of sourcePlaces) {
      try {
        const existingPlace = targetPlacesByName.get(place.name);
        
        if (existingPlace) {
          if (overwrite) {
            existingPlace.description = place.description;
            existingPlace.type = place.type;
            existingPlace.lat = place.lat;
            existingPlace.lng = place.lng;
            await repo.save(existingPlace);
            overwrittenCount++;
          } else {
            skippedCount++;
          }
        } else {
          const newPlace = repo.create({
            name: place.name,
            description: place.description,
            type: place.type,
            lat: place.lat,
            lng: place.lng,
            gameId: new Types.ObjectId(targetGameId),
          });
          await repo.save(newPlace);
          copiedCount++;
        }
      } catch (error) {
        console.error(`Failed to copy place "${place.name}":`, error.message);
        errorCount++;
      }
    }

    return {
      copiedCount,
      skippedCount,
      overwrittenCount,
      errorCount,
    };
  }

  async deleteAllByGameId(gameId: string): Promise<number> {
    const repo = this.repo.getRepository();
    const places = await repo.find({ where: { gameId: new Types.ObjectId(gameId) } });
    let deletedCount = 0;
    for (const place of places) {
      await repo.delete(place._id);
      deletedCount++;
    }
    return deletedCount;
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

  @Post('copy')
  @UseGuards(LoggedIn)
  async copyPlaces(@Body() copyPlacesDto: CopyPlacesDto): Promise<CopyResultDto> {
    return this.placesService.copyPlaces(copyPlacesDto.sourceGameId, copyPlacesDto.targetGameId, copyPlacesDto.overwrite);
  }

  @Delete('game/:gameId')
  @UseGuards(LoggedIn)
  async deleteAllByGameId(@Param('gameId') gameId: string): Promise<{ deletedCount: number }> {
    const deletedCount = await this.placesService.deleteAllByGameId(gameId);
    return { deletedCount };
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Place]), AuthenticationModule, GamesModule],
  controllers: [PlacesController],
  providers: [PlacesService, PlaceMapper, PlacesRepository],
  exports: [PlacesService, PlaceMapper]
})
export class PlacesModule {}
