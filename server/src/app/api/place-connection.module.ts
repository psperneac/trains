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
import { PlacesModule, PlacesService } from './places.module';

@Schema({ collection: 'place_connections' })
export class PlaceConnection extends AbstractMongoEntity {
  @Prop({ type: String, length: 20 })
  @Expose()
  type: string;

  @Prop({ type: String, length: 250 })
  @Expose()
  name: string;

  @Prop({ type: String, length: 250 })
  @Expose()
  description: string;

  @Prop({ type: Object })
  @Expose()
  content: any;

  @Prop({ type: Types.ObjectId, ref: 'Place', required: true })
  @Expose()
  startId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Place', required: true })
  @Expose()
  endId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  @Expose()
  gameId: Types.ObjectId;
}

export type PlaceConnectionDocument = HydratedDocument<PlaceConnection>;
export const PlaceConnectionSchema = SchemaFactory.createForClass(PlaceConnection);

export interface PlaceConnectionDto {
  id?: string;
  type: string;
  name: string;
  description: string;
  content: any;
  startId: string;
  endId: string;
  gameId: string;
  created?: string;
  updated?: string;
}

export class CopyPlaceConnectionsDto {
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
export class PlaceConnectionsService extends AbstractMongoService<PlaceConnection> {
  constructor(
    @InjectModel(PlaceConnection.name) private readonly connectionModel: Model<PlaceConnectionDocument>,
    private readonly placesService: PlacesService
  ) {
    super(connectionModel);
  }

  async findByGameId(gameId: string, pagination?: PageRequestDto): Promise<PageDto<PlaceConnection>> {
    return this.findAllWhere({ gameId: new Types.ObjectId(gameId) }, pagination);
  }

  async copyPlaceConnections(sourceGameId: string, targetGameId: string, overwrite: boolean): Promise<CopyResultDto> {
    const sourceConnections = await this.connectionModel.find({ gameId: new Types.ObjectId(sourceGameId) }).exec();
    const targetConnections = await this.connectionModel.find({ gameId: new Types.ObjectId(targetGameId) }).exec();

    const targetConnectionsByRoute = new Map(
      targetConnections.map(c => [`${c.startId.toString()}-${c.endId.toString()}`, c])
    );

    const sourcePlacesResult = await this.placesService.findAllWhere({ gameId: new Types.ObjectId(sourceGameId) });
    const sourcePlaceIdToName = new Map(sourcePlacesResult.data.map((p: any) => [p._id?.toString() || p.id, p.name]));

    const targetPlacesResult = await this.placesService.findAllWhere({ gameId: new Types.ObjectId(targetGameId) });
    const targetPlaceNameToId = new Map(targetPlacesResult.data.map((p: any) => [p.name, p._id?.toString() || p.id]));

    let copiedCount = 0;
    let skippedCount = 0;
    let overwrittenCount = 0;
    let errorCount = 0;

    for (const connection of sourceConnections) {
      try {
        const startName = sourcePlaceIdToName.get(connection.startId.toString());
        const endName = sourcePlaceIdToName.get(connection.endId.toString());

        if (!startName || !endName) {
          skippedCount++;
          continue;
        }

        const targetStartId = targetPlaceNameToId.get(startName);
        const targetEndId = targetPlaceNameToId.get(endName);

        if (!targetStartId || !targetEndId) {
          skippedCount++;
          continue;
        }

        const routeKey = `${targetStartId}-${targetEndId}`;
        const existingConnection = targetConnectionsByRoute.get(routeKey);

        if (existingConnection) {
          if (overwrite) {
            existingConnection.name = connection.name;
            existingConnection.description = connection.description;
            existingConnection.type = connection.type;
            existingConnection.content = connection.content;
            await existingConnection.save();
            overwrittenCount++;
          } else {
            skippedCount++;
          }
        } else {
          await this.connectionModel.create({
            type: connection.type,
            name: connection.name,
            description: connection.description,
            content: connection.content,
            startId: new Types.ObjectId(targetStartId),
            endId: new Types.ObjectId(targetEndId),
            gameId: new Types.ObjectId(targetGameId),
          });
          copiedCount++;
        }
      } catch (error) {
        console.error(`Failed to copy connection "${connection.name}" (${connection.startId} -> ${connection.endId}):`, error.message);
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
    const result = await this.connectionModel.deleteMany({ gameId: new Types.ObjectId(gameId) }).exec();
    return result.deletedCount || 0;
  }
}

@Injectable()
export class PlaceConnectionMapper extends AbstractMongoDtoMapper<PlaceConnection, PlaceConnectionDto> {
  async toDto(domain: PlaceConnection): Promise<PlaceConnectionDto> {
    if (!domain) {
      return null;
    }

    return {
      id: (domain as any).id || (domain as any)._id?.toString(),
      type: domain.type,
      name: domain.name,
      description: domain.description,
      content: domain.content,
      startId: domain.startId?.toString(),
      endId: domain.endId?.toString(),
      gameId: domain.gameId?.toString(),
      created: domain.created?.toISOString(),
      updated: domain.updated?.toISOString(),
    };
  }

  async toDomain(dto: PlaceConnectionDto, domain?: Partial<PlaceConnection> | PlaceConnection): Promise<PlaceConnection> {
    if (!dto) {
      return domain as any as PlaceConnection;
    }

    if (!domain) {
      domain = {} as Partial<PlaceConnection>;
    }

    const { startId, endId, gameId, ...fixedDto } = dto;

    return {
      ...domain,
      ...fixedDto,
      startId: startId ? new Types.ObjectId(startId) : (domain as any).startId,
      endId: endId ? new Types.ObjectId(endId) : (domain as any).endId,
      gameId: gameId ? new Types.ObjectId(gameId) : (domain as any).gameId,
    } as any as PlaceConnection;
  }
}

@Controller('place-connections')
@UseFilters(AllExceptionsFilter)
export class PlaceConnectionController extends AbstractMongoServiceController<PlaceConnection, PlaceConnectionDto> {
  constructor(
    private readonly placeConnectionsService: PlaceConnectionsService,
    private readonly placeConnectionMapper: PlaceConnectionMapper
  ) {
    super(placeConnectionsService, placeConnectionMapper);
  }

  @Get('game/:gameId')
  @UseGuards(LoggedIn)
  async findByGameId(
    @Param('gameId') gameId: string,
    @Query() pagination: PageRequestDto
  ): Promise<PageDto<PlaceConnectionDto>> {
    const page = await this.placeConnectionsService.findByGameId(gameId, pagination);
    return this.handlePagedResults(page, this.placeConnectionMapper);
  }

  @Post('copy')
  @UseGuards(LoggedIn)
  async copyPlaceConnections(@Body() copyDto: CopyPlaceConnectionsDto): Promise<CopyResultDto> {
    return this.placeConnectionsService.copyPlaceConnections(copyDto.sourceGameId, copyDto.targetGameId, copyDto.overwrite);
  }

  @Delete('game/:gameId')
  @UseGuards(LoggedIn)
  async deleteAllByGameId(@Param('gameId') gameId: string): Promise<{ deletedCount: number }> {
    const deletedCount = await this.placeConnectionsService.deleteAllByGameId(gameId);
    return { deletedCount };
  }
}

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PlaceConnection.name, schema: PlaceConnectionSchema }]),
    PlacesModule,
    GamesModule
  ],
  controllers: [PlaceConnectionController],
  providers: [PlaceConnectionsService, PlaceConnectionMapper],
  exports: [PlaceConnectionsService, PlaceConnectionMapper]
})
export class PlaceConnectionsModule {}

// Backward compatibility alias
export { PlaceConnectionsService as PlaceConnectionService };
