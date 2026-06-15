import { Body, Controller, Delete, forwardRef, Get, HttpException, HttpStatus, Injectable, Module, Param, Post, Query, Req, UseFilters, UseGuards } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { Request } from 'express';
import { Admin, LoggedIn } from '../../authentication/authentication.guard';
import { PageDto } from '../../models/page.model';
import { PageRequestDto } from '../../models/pagination.model';
import { AbstractMongoDtoMapper } from '../../utils/abstract-dto-mapper';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractMongoEntity } from '../../utils/abstract-mongo.entity';
import { HydratedDocument, Model, Types } from 'mongoose';
import { AbstractMongoService } from '../../utils/abstract-mongo.service';
import { AbstractMongoServiceController } from '../../utils/abstract-mongo-service.controller';
import { PlacesModule, Place, PlaceDocument, PlaceSchema } from './places.module';
import { PlaceConnectionsModule, PlaceConnection, PlaceConnectionDocument, PlaceConnectionSchema } from './place-connection.module';
import { PlaceInstancesModule, PlaceInstance, PlaceInstanceDocument, PlaceInstanceSchema } from './place-instance.module';
import { VehicleInstancesModule, VehicleInstance, VehicleInstanceDocument, VehicleInstanceSchema } from './vehicle-instances.module';
import { PlayersModule, Player, PlayerDocument, PlayerSchema } from './support/players.module';

export enum GameType {
  TEMPLATE = 'TEMPLATE',
  GAME = 'GAME'
}

@Schema({ collection: 'games'})
export class Game extends AbstractMongoEntity {
  @Prop()
  @Expose()
  name: string;

  @Prop()
  @Expose()
  description: string;

  @Prop()
  @Expose()
  type: GameType;

  @Prop({ type: Object })
  @Expose()
  content: any;

  @Prop({ default: false })
  @Expose()
  locked: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  @Expose()
  lockedBy: Types.ObjectId | null;

  /**
   * Speed multiplier for travel time calculations.
   * A vehicle traveling at 60 km/h with a multiplier of 60 will take 1 minute to travel 60 km.
   * If undefined/null, defaults to 60.
   */
  @Prop({ default: null })
  @Expose()
  speedMultiplier: number | null;
}

export type GameDocument = HydratedDocument<Game>;
export const GameSchema = SchemaFactory.createForClass(Game);

export interface GameDto {
  id: string;
  name: string;
  description: string;
  type: GameType;
  content: any;
  locked: boolean;
  lockedBy: string | null;
  speedMultiplier: number | null;
}

@Injectable()
export class GamesService extends AbstractMongoService<Game> {
  constructor(
    @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
    @InjectModel(Place.name) private readonly placeModel: Model<PlaceDocument>,
    @InjectModel(PlaceConnection.name) private readonly connectionModel: Model<PlaceConnectionDocument>,
    @InjectModel(PlaceInstance.name) private readonly placeInstanceModel: Model<PlaceInstanceDocument>,
    @InjectModel(VehicleInstance.name) private readonly vehicleInstanceModel: Model<VehicleInstanceDocument>,
    @InjectModel(Player.name) private readonly playerModel: Model<PlayerDocument>
  ) {
    super(gameModel);
  }

  async findByType(type: GameType, pagination?: PageRequestDto): Promise<PageDto<Game>> {
    return this.findAllWhere({ type }, pagination);
  }

  async lock(gameId: string, adminId: string): Promise<Game> {
    const game = await this.findOne(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    return this.update(gameId, { locked: true, lockedBy: new Types.ObjectId(adminId) } as any);
  }

  async unlock(gameId: string, adminId: string): Promise<Game> {
    const game = await this.findOne(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    // Only the admin who locked it or an admin can unlock
    const lockedBy = game.lockedBy?.toString();
    if (lockedBy && lockedBy !== adminId) {
      throw new Error('Only the admin who locked this game or an admin can unlock it');
    }
    return this.update(gameId, { locked: false, lockedBy: null } as any);
  }

  async delete(id: string, adminId?: string): Promise<boolean> {
    const objectId = new Types.ObjectId(id);

    // Check if game is locked
    const game = await this.findOne(id);
    if (!game) {
      return false;
    }
    if (game.locked) {
      const lockedBy = game.lockedBy?.toString();
      // Only the admin who locked it can delete
      if (lockedBy && lockedBy !== adminId) {
        throw new Error('Game is locked. Only the admin who locked it can delete it.');
      }
    }

    // Delete all VehicleInstances associated with this game
    await this.vehicleInstanceModel.deleteMany({ gameId: objectId }).exec();

    // Delete all PlaceInstances associated with this game
    await this.placeInstanceModel.deleteMany({ gameId: objectId }).exec();

    // Delete all Players associated with this game
    await this.playerModel.deleteMany({ gameId: objectId }).exec();

    // Delete all PlaceConnections associated with this game
    await this.connectionModel.deleteMany({ gameId: objectId }).exec();

    // Delete all Places associated with this game
    await this.placeModel.deleteMany({ gameId: objectId }).exec();

    // Delete the game itself
    const result = await this.gameModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}

@Injectable()
export class GameMapper extends AbstractMongoDtoMapper<Game, GameDto> {
  constructor() {
    super();
  }

  async toDto(domain: Game): Promise<GameDto> {
    if (!domain) {
      return null;
    }

    const dto: GameDto = {
      id: (domain as any).id || (domain as any)._id?.toString(),
      name: domain.name,
      description: domain.description,
      type: domain.type,
      content: domain.content,
      locked: domain.locked ?? false,
      lockedBy: domain.lockedBy?.toString() ?? null,
      speedMultiplier: domain.speedMultiplier ?? null
    };

    return dto;
  }

  async toDomain(dto: GameDto, domain?: Game | Partial<Game>): Promise<Game> {
    if (!dto) {
      return domain as any as Game;
    }

    if (!domain) {
      domain = {};
    }

    return {
      ...domain,
      ...dto,
      lockedBy: dto.lockedBy ? new Types.ObjectId(dto.lockedBy) : null
    } as Game;
  }
}

@Controller('games')
@UseFilters(AllExceptionsFilter)
export class GamesController extends AbstractMongoServiceController<Game, GameDto> {
  constructor(
    private readonly gamesService: GamesService,
    private readonly gameMapper: GameMapper
  ) {
    super(gamesService, gameMapper);
  }

  @Get('type/:type')
  @UseGuards(LoggedIn)
  async findByType(
    @Param('type') type: GameType,
    @Query() pagination: PageRequestDto
  ): Promise<PageDto<GameDto>> {
    const page = await this.gamesService.findByType(type, pagination);
    return this.handlePagedResults(page, this.gameMapper);
  }

  @Post(':id/lock')
  @UseGuards(Admin)
  async lock(@Param('id') id: string, @Req() request: Request): Promise<GameDto> {
    const adminId = (request as any).user?._id?.toString();
    try {
      const game = await this.gamesService.lock(id, adminId);
      return this.gameMapper.toDto(game);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post(':id/unlock')
  @UseGuards(Admin)
  async unlock(@Param('id') id: string, @Req() request: Request): Promise<GameDto> {
    const adminId = (request as any).user?._id?.toString();
    try {
      const game = await this.gamesService.unlock(id, adminId);
      return this.gameMapper.toDto(game);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @UseGuards(Admin)
  async remove(@Param('id') id: string, @Req() request: Request): Promise<boolean> {
    const adminId = (request as any).user?._id?.toString();
    try {
      return await this.gamesService.delete(id, adminId);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: Place.name, schema: PlaceSchema },
      { name: PlaceConnection.name, schema: PlaceConnectionSchema },
      { name: PlaceInstance.name, schema: PlaceInstanceSchema },
      { name: VehicleInstance.name, schema: VehicleInstanceSchema },
      { name: Player.name, schema: PlayerSchema }
    ])
  ],
  controllers: [GamesController],
  providers: [GamesService, GameMapper],
  exports: [GamesService, GameMapper, MongooseModule]
})
export class GamesModule {}
