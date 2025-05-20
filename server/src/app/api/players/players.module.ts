import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Injectable,
  Module,
  Param,
  Post,
  Put,
  UseFilters,
  UseGuards
} from '@nestjs/common';
import { InjectModel, MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { LoggedIn } from '../../../authentication/authentication.guard';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import ParamsWithMongoId from '../../../utils/params-with-mongo-id';

import { AuthenticationModule } from './../../../authentication/authentication.module';

@Schema()
export class Player {
  @Prop()
  public uuid: string;

  @Prop()
  public name: string;

  @Prop()
  public description: string;

  @Prop()
  public walletId: string;

  @Prop()
  public userId: string;

  @Prop()
  public mapId: string;

  @Prop()
  public vehicles: string[];

  @Prop()
  public places: string[];

  @Prop()
  public placeConnections: string[];

  @Prop({ type: Object })
  public content: any;
}

export type PlayerDocument = HydratedDocument<Player>;

export const PlayerSchema = SchemaFactory.createForClass(Player);

export interface PlayerDto {
  id: string;
  name: string;
  description: string;
  walletId: string;
  userId: string;
  mapId: string;
  vehicles: string[];
  places: string[];
  placeConnections: string[];
  content: any;
}

@Injectable()
export class PlayersService {
  constructor(@InjectModel(Player.name) private playerModel: Model<PlayerDocument>) {}

  async getAll() {
    const ret = await this.playerModel.find().exec();
    if (ret && ret.length > 0) {
      return ret.map(player => player.toObject({ getters: true }));
    }
    return [];
  }

  async getOne(id: string) {
    const player = await this.playerModel.findById(id).exec();
    if (player) {
      return player.toObject({ getters: true });
    }
    throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
  }

  async update(id: string, playerDto: PlayerDto) {
    const updatedPlayer = await this.playerModel
      .findByIdAndUpdate(id, playerDto)
      .setOptions({ overwrite: true, new: true });

    if (updatedPlayer) {
      return updatedPlayer.toObject({ getters: true });
    }

    throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
  }

  async create(playerDto: PlayerDto) {
    const newPlayer = new this.playerModel(playerDto);
    const savedPlayer = await newPlayer.save();
    return savedPlayer ? savedPlayer.toObject({ getters: true }) : null;
  }

  async delete(id: string) {
    const deleteResponse = await this.playerModel.findByIdAndDelete(id);
    if (!deleteResponse) {
      throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
    }

    return true;
  }
}

@Controller('players')
@UseGuards(LoggedIn)
@UseFilters(AllExceptionsFilter)
export class PlayersController {
  constructor(private readonly service: PlayersService) {}

  @Get()
  getAllPlayers() {
    return this.service.getAll();
  }

  @Get(':id')
  getPlayerById(@Param() { id }: ParamsWithMongoId) {
    return this.service.getOne(id);
  }

  @Post()
  async createPlayer(@Body() player: PlayerDto) {
    player = {
      ...player,
      vehicles: !!player.vehicles && player.vehicles.length === 0 ? undefined : player.vehicles,
      places: !!player.places && player.places.length === 0 ? undefined : player.places,
      placeConnections:
        !!player.placeConnections && player.placeConnections.length === 0 ? undefined : player.placeConnections
    };
    return this.service.create(player);
  }

  @Put(':id')
  async replacePlayer(@Param() { id }: ParamsWithMongoId, @Body() player: PlayerDto) {
    return this.service.update(id, player);
  }

  @Delete(':id')
  async deletePlayer(@Param() { id }: ParamsWithMongoId) {
    return this.service.delete(id);
  }
}

@Module({
  imports: [Player, MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]), AuthenticationModule],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [Player]
})
export class PlayersModule {}
