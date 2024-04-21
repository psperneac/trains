import { AuthenticationModule } from './../../../authentication/authentication.module';
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

@Schema()
export class Player {
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

  @Prop()
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
    return await this.playerModel.find().exec();
  }

  async getOne(uuid: string) {
    const player = await this.playerModel.findById(uuid).exec();
    if (player) {
      return player;
    }
    throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
  }

  async update(uuid: string, playerDto: PlayerDto) {
    const updatedPlayer = await this.playerModel
      .findByIdAndUpdate(uuid, playerDto)
      .setOptions({ overwrite: true, new: true });

    if (updatedPlayer) {
      return updatedPlayer;
    }

    throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
  }

  create(playerDto: PlayerDto) {
    const newPlayer = new this.playerModel(playerDto);
    return newPlayer.save();
  }

  async delete(uuid: string) {
    const deleteResponse = await this.playerModel.findByIdAndDelete(uuid);
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
  getPlayerById(uuid: string) {
    return this.service.getOne(uuid);
  }

  @Post()
  async createPlayer(@Body() player: PlayerDto) {
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
  imports: [MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]), AuthenticationModule],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService]
})
export class PlayersModule {}
