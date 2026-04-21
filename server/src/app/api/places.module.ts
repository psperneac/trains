import { Body, Controller, Delete, Get, Injectable, Module, Param, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { LoggedIn } from '../../authentication/authentication.guard';
import { PageDto } from '../../models/page.model';
import { PageRequestDto } from '../../models/pagination.model';
import { AbstractMongoDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractMongoEntity } from '../../utils/abstract-mongo.entity';
import { AbstractMongoService } from '../../utils/abstract-mongo.service';
import { AbstractMongoServiceController } from '../../utils/abstract-mongo-service.controller';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, HydratedDocument, DeepPartial } from 'mongoose';
import { GamesModule } from './games.module';

@Schema({ collection: 'places' })
export class Place extends AbstractMongoEntity {
  @Prop({ required: true })
  @Expose()
  name: string;

  @Prop()
  @Expose()
  description: string;

  @Prop()
  @Expose()
  type: string;

  @Prop()
  @Expose()
  lat: number;

  @Prop()
  @Expose()
  lng: number;

  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  @Expose()
  gameId: Types.ObjectId;

  @Prop({ default: 1000 })
  @Expose()
  priceGold: number;

  @Prop({ default: 0 })
  @Expose()
  priceGems: number;
}

export type PlaceDocument = HydratedDocument<Place>;
export const PlaceSchema = SchemaFactory.createForClass(Place);

export interface PlaceDto {
  id?: string;
  name: string;
  description: string;
  type: string;
  lat: number;
  lng: number;
  gameId: string;
  priceGold: number;
  priceGems: number;
  created?: string;
  updated?: string;
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
export class PlacesService extends AbstractMongoService<Place> {
  constructor(@InjectModel(Place.name) private readonly placeModel: Model<PlaceDocument>) {
    super(placeModel);
  }

  async findByGameId(gameId: string, pagination?: PageRequestDto): Promise<PageDto<Place>> {
    return this.findAllWhere({ gameId: new Types.ObjectId(gameId) }, pagination);
  }

  async copyPlaces(sourceGameId: string, targetGameId: string, overwrite: boolean): Promise<CopyResultDto> {
    const sourcePlaces = await this.placeModel.find({ gameId: new Types.ObjectId(sourceGameId) }).exec();
    const targetPlaces = await this.placeModel.find({ gameId: new Types.ObjectId(targetGameId) }).exec();

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
            await existingPlace.save();
            overwrittenCount++;
          } else {
            skippedCount++;
          }
        } else {
          await this.placeModel.create({
            name: place.name,
            description: place.description,
            type: place.type,
            lat: place.lat,
            lng: place.lng,
            gameId: new Types.ObjectId(targetGameId),
          });
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
    const result = await this.placeModel.deleteMany({ gameId: new Types.ObjectId(gameId) }).exec();
    return result.deletedCount || 0;
  }
}

@Injectable()
export class PlaceMapper extends AbstractMongoDtoMapper<Place, PlaceDto> {
  async toDto(domain: Place): Promise<PlaceDto> {
    if (!domain) {
      return null;
    }

    return {
      id: (domain as any).id || (domain as any)._id?.toString(),
      name: domain.name,
      description: domain.description,
      type: domain.type,
      lat: domain.lat,
      lng: domain.lng,
      gameId: domain.gameId?.toString(),
      priceGold: domain.priceGold ?? 1000,
      priceGems: domain.priceGems ?? 0,
      created: domain.created?.toISOString(),
      updated: domain.updated?.toISOString(),
    };
  }

  async toDomain(dto: PlaceDto, domain?: Place | Partial<Place>): Promise<Place> {
    if (!dto) {
      return domain as Place;
    }

    if (!domain) {
      domain = {} as Partial<Place>;
    }

    const { gameId, ...fixedDto } = dto;

    return {
      ...domain,
      ...fixedDto,
      gameId: gameId ? new Types.ObjectId(gameId) : (domain as any).gameId,
    } as Place;
  }
}

@Controller('places')
@UseFilters(AllExceptionsFilter)
export class PlacesController extends AbstractMongoServiceController<Place, PlaceDto> {
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
  imports: [
    MongooseModule.forFeature([{ name: Place.name, schema: PlaceSchema }]),
    GamesModule
  ],
  controllers: [PlacesController],
  providers: [PlacesService, PlaceMapper],
  exports: [PlacesService, PlaceMapper]
})
export class PlacesModule {}
