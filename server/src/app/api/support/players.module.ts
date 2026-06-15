import { Body, Controller, Delete, Get, HttpException, HttpStatus, Injectable, Module, Param, Post, Query, Req, UseFilters, UseGuards } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { RequestWithUser } from '../../../authentication/authentication.model';
import { Admin, LoggedIn, UserOrAdmin } from '../../../authentication/authentication.guard';
import { PageDto } from '../../../models/page.model';
import { PageRequestDto } from '../../../models/pagination.model';
import { AbstractMongoDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractMongoEntity } from '../../../utils/abstract-mongo.entity';
import { AbstractMongoService } from '../../../utils/abstract-mongo.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, HydratedDocument } from 'mongoose';
import { EntityType, TransactionType, TransactionsModule, TransactionsService } from './transactions.module';
import { User, UserDto } from './users.module';
import { Wallet, WalletDto, SendGoldAndGemsDto } from './wallet.model';
import { PlaceInstancesModule, PlaceInstanceMapper, PlaceInstancesService } from '../place-instance.module';
import { VehicleInstancesModule, VehicleInstanceMapper, VehicleInstancesService } from '../vehicle-instances.module';
import { PlaceConnectionService, PlaceConnectionDto, PlaceConnectionsModule } from '../place-connection.module';
import { PlacesModule } from '../places.module';
import { MapRevealService } from '../../game/map-reveal/map-reveal.service';
import { AbstractMongoServiceController } from 'src/utils/abstract-mongo-service.controller';

export { Wallet, WalletDto, SendGoldAndGemsDto };

@Schema({ collection: 'players' })
export class Player extends AbstractMongoEntity {
  @Prop({ required: true })
  @Expose()
  name: string;

  @Prop()
  @Expose()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @Expose()
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  @Expose()
  gameId: Types.ObjectId;

  @Prop({ type: Object })
  @Expose()
  wallet: { gold: number; gems: number; parts: number; content: any };

  @Prop({ type: Object })
  @Expose()
  content: any;
}

export type PlayerDocument = HydratedDocument<Player>;
export const PlayerSchema = SchemaFactory.createForClass(Player);

export interface PlayerDto {
  id?: string;
  name: string;
  description: string;
  userId: string;
  gameId: string;
  wallet?: WalletDto;
  content: any;
  created?: string;
  updated?: string;
}

/**
 * Full state response DTO for debugging and verifying data flow.
 * Includes player data along with all owned place instances and vehicle instances.
 */
export interface PlayerFullStateDto {
  player: PlayerDto;
  placeInstances: any[];
  vehicleInstances: any[];
}

/**
 * Response DTO for map view endpoint.
 * Contains owned place instances (with job offers), available places (with prices),
 * and the connections between places for rendering the map.
 */
export interface MapViewResponseDto {
  owned: any[];
  available: any[];
  connections: PlaceConnectionDto[];
}

/**
 * Response DTO for available places endpoint.
 * Returns only the places available for purchase by the player.
 */
export interface AvailablePlacesResponseDto {
  places: any[];
  ownedPlaceIds: string[];
}

@Injectable()
export class PlayersService extends AbstractMongoService<Player> {
  constructor(@InjectModel(Player.name) private readonly playerModel: Model<PlayerDocument>) {
    super(playerModel);
  }

  async findAllByUserId(userId: string, pagination?: PageRequestDto): Promise<PageDto<Player>> {
    return this.findAllWhere({ userId: new Types.ObjectId(userId) }, pagination);
  }

  async findAllByGameId(gameId: string, pagination?: PageRequestDto): Promise<PageDto<Player>> {
    return this.findAllWhere({ gameId: new Types.ObjectId(gameId) }, pagination);
  }

  async sendGoldAndGems(playerId: string, gold: number, gems: number, parts: number): Promise<Player> {
    const player = await this.findOne(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    if (!player.wallet) {
      player.wallet = { gold: 0, gems: 0, parts: 0, content: {} };
    }

    player.wallet.gold += gold;
    player.wallet.gems += gems;
    player.wallet.parts += parts;

    return this.update(playerId, player);
  }
}

@Injectable()
export class PlayerMapper extends AbstractMongoDtoMapper<Player, PlayerDto> {
  async toDto(domain: Player, currentUser?: User): Promise<PlayerDto> {
    if (!domain) {
      return null;
    }

    const dto: PlayerDto = {
      id: (domain as any).id || (domain as any)._id?.toString(),
      name: domain.name,
      description: domain.description,
      userId: domain.userId?.toString(),
      gameId: domain.gameId?.toString(),
      content: domain.content,
    };

    if (!currentUser || !this.shouldIncludeWallet(domain, currentUser)) {
      dto.wallet = undefined;
    } else {
      dto.wallet = { ...domain.wallet, id: (domain as any).id || (domain as any)._id?.toString() } as WalletDto;
    }

    return dto;
  }

  private shouldIncludeWallet(player: Player, currentUser?: User): boolean {
    if (!currentUser) {
      return false;
    }
    if (currentUser.scope === 'ADMIN') {
      return true;
    }
    if (currentUser.scope === 'USER') {
      return currentUser._id?.toString() === player.userId?.toString();
    }
    return false;
  }

  async toDomain(dto: PlayerDto, domain?: Player | Partial<Player>): Promise<Player> {
    if (!dto) {
      return domain as Player;
    }

    if (!domain) {
      domain = {} as Partial<Player>;
    }

    return {
      ...domain,
      name: dto.name,
      description: dto.description,
      userId: dto.userId ? new Types.ObjectId(dto.userId) : (domain as any).userId,
      gameId: dto.gameId ? new Types.ObjectId(dto.gameId) : (domain as any).gameId,
      wallet: dto.wallet ? { ...dto.wallet } : (domain as any).wallet,
      content: dto.content,
    } as Player;
  }
}

@Controller('players')
@UseFilters(AllExceptionsFilter)
export class PlayerController extends AbstractMongoServiceController<Player, PlayerDto> {
  constructor(
    private readonly playersService: PlayersService,
    private readonly playersMapper: PlayerMapper,
    private readonly transactionsService: TransactionsService,
    private readonly placeInstancesService: PlaceInstancesService,
    private readonly placeInstanceMapper: PlaceInstanceMapper,
    private readonly vehicleInstancesService: VehicleInstancesService,
    private readonly vehicleInstanceMapper: VehicleInstanceMapper,
    private readonly mapRevealService: MapRevealService,
    private readonly placeConnectionService: PlaceConnectionService) {
      super(playersService, playersMapper);
  }

  @Get('by-user/:userId')
  @UseGuards(LoggedIn)
  async findAllByUserId(
    @Param('userId') userId: string,
    @Query() pagination: PageRequestDto,
    @Req() request: RequestWithUser
  ): Promise<PageDto<PlayerDto>> {
    const currentUser = request.user || undefined;
    return this.playersService.findAllByUserId(userId, pagination).then(
      this.makeHandlerWithUser(currentUser)
    );
  }

  @Get(':id')
  @UseGuards(LoggedIn)
  async findOne(@Param('id') id: string): Promise<PlayerDto> {
    return this.playersService.findOne(id).then(async domain => {
      if (!domain) {
        throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
      }
      const found = await this.playersMapper.toDto(domain);
      if (!found) {
        throw new HttpException('Entity not found', HttpStatus.NOT_FOUND);
      }
      return found;
    });
  }

  @Get()
  @UseGuards(LoggedIn)
  async findAll(@Query() pagination: PageRequestDto): Promise<PageDto<PlayerDto>> {
    return this.playersService.findAll(pagination).then(this.makeHandler());
  }

  public makeHandler() {
    return (page: PageDto<Player>) => this.handlePagedResults(page, this.playersMapper);
  }

  public async handlePagedResults(page: PageDto<Player>, mapper: PlayerMapper) {
    const mappedData = await Promise.all(page?.data?.map(async item => {
      return await mapper.toDto(item);
    }));
    return { ...page, data: mappedData };
  }

  @Delete(':id')
  @UseGuards(LoggedIn, UserOrAdmin)
  async delete(@Param('id') id: string, @Req() request: RequestWithUser): Promise<{ success: boolean }> {
    const currentUser = request.user;
    const canDeleteResult = await this.canDelete(id, currentUser);

    if (!canDeleteResult) {
      throw new HttpException('Delete operation not allowed', HttpStatus.FORBIDDEN);
    }

    const placeInstancesPage = await this.placeInstancesService.findAllByPlayer({}, id);
    for (const pi of placeInstancesPage.data) {
      await this.placeInstancesService.delete(pi._id.toString());
    }

    const vehicleInstancesPage = await this.vehicleInstancesService.findAllByPlayer({}, id);
    for (const vi of vehicleInstancesPage.data) {
      await this.vehicleInstancesService.delete(vi._id.toString());
    }

    await this.playersService.delete(id);
    return { success: true };
  }

  @Get('by-game/:gameId')
  @UseGuards(LoggedIn)
  async findAllByGameId(
    @Param('gameId') gameId: string,
    @Query() pagination: PageRequestDto,
    @Req() request: RequestWithUser
  ): Promise<PageDto<PlayerDto>> {
    const currentUser = request.user || undefined;
    return this.playersService.findAllByGameId(gameId, pagination).then(
      this.makeHandlerWithUser(currentUser)
    );
  }

  private makeHandlerWithUser(currentUser?: User) {
    return (page: PageDto<Player>) => this.handlePagedResultsWithUser(page, currentUser);
  }

  private async handlePagedResultsWithUser(page: PageDto<Player>, currentUser?: User): Promise<PageDto<PlayerDto>> {
    const mappedData = await Promise.all(
      page?.data?.map(item => this.playersMapper.toDto(item, currentUser)) || []
    );
    return { ...page, data: mappedData };
  }

  @Post('send')
  @UseGuards(LoggedIn, Admin)
  async sendGoldAndGems(
    @Body() sendDto: SendGoldAndGemsDto,
    @Req() request: RequestWithUser
  ): Promise<PlayerDto> {
    const currentUser = request.user;

    await this.transactionsService.createTransaction(
      TransactionType.GOLD_GEMS_TRANSFER,
      currentUser._id.toString(),
      EntityType.USER,
      sendDto.playerId,
      EntityType.PLAYER,
      {
        gold: sendDto.gold,
        gems: sendDto.gems,
        parts: sendDto.parts,
        adminId: currentUser._id.toString(),
        adminUsername: currentUser.username,
      },
      `Admin ${currentUser.username} sent ${sendDto.gold} gold, ${sendDto.gems} gems, and ${sendDto.parts} parts to player`
    );

    return this.playersService.sendGoldAndGems(sendDto.playerId, sendDto.gold, sendDto.gems, sendDto.parts).then(
      player => this.playersMapper.toDto(player, currentUser)
    );
  }

  protected async canDelete(playerId: string, currentUser: User): Promise<boolean> {
    if (currentUser.scope === 'ADMIN') {
      return true;
    }
    const player = await this.playersService.findOne(playerId);
    if (!player) {
      return false;
    }
    return player.userId?.toString() === currentUser._id.toString();
  }

  @Get(':id/full-state')
  @UseGuards(LoggedIn)
  async getFullState(@Param('id') playerId: string): Promise<PlayerFullStateDto> {
    const player = await this.playersService.findOne(playerId);
    if (!player) {
      throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
    }

    const playerDto = await this.playersMapper.toDto(player);

    const placeInstancesPage = await this.placeInstancesService.findAllByPlayer({}, playerId);
    const placeInstances = await Promise.all(
      placeInstancesPage.data.map(pi => this.placeInstanceMapper.toDto(pi))
    );

    const vehicleInstancesPage = await this.vehicleInstancesService.findAllByPlayer({}, playerId);
    const vehicleInstances = await Promise.all(
      vehicleInstancesPage.data.map(vi => this.vehicleInstanceMapper.toDto(vi))
    );

    return { player: playerDto, placeInstances, vehicleInstances };
  }

  @Get(':id/map-view')
  @UseGuards(LoggedIn)
  async getMapView(@Param('id') playerId: string): Promise<MapViewResponseDto> {
    const player = await this.playersService.findOne(playerId);
    if (!player) {
      throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
    }

    const ownedPlaceInstancesPage = await this.placeInstancesService.findAllByPlayer({}, playerId);
    const ownedPlaceInstances = await Promise.all(
      ownedPlaceInstancesPage.data.map(pi => this.placeInstanceMapper.toDto(pi))
    );

    const availablePlaces = await this.mapRevealService.getAvailablePlaces(playerId);

    const ownedPlaceIds = ownedPlaceInstances
      .map(pi => pi.placeId)
      .filter(id => id);

    const allConnectionsPage = await this.placeConnectionService.findAllWhere(
      { gameId: new Types.ObjectId(player.gameId.toString()) } as any,
      { page: 1, pageSize: 1000 } as any
    );

    const relevantPlaceIds = new Set([
      ...ownedPlaceIds,
      ...availablePlaces.map(p => p._id?.toString()).filter(id => id)
    ]);

    const relevantConnections = allConnectionsPage.data.filter(conn => {
      const startId = conn.startId?.toString();
      const endId = conn.endId?.toString();
      return relevantPlaceIds.has(startId) || relevantPlaceIds.has(endId);
    });

    const connections: PlaceConnectionDto[] = await Promise.all(
      relevantConnections.map(async (conn: any) => ({
        id: conn._id?.toString(),
        type: conn.type,
        name: conn.name,
        description: conn.description,
        content: conn.content,
        startId: conn.startId?.toString(),
        endId: conn.endId?.toString(),
        gameId: conn.gameId?.toString()
      }))
    );

    return {
      owned: ownedPlaceInstances,
      available: availablePlaces.map(place => ({
        id: place._id?.toString(),
        name: place.name,
        description: place.description,
        type: place.type,
        lat: place.lat,
        lng: place.lng,
        gameId: place.gameId?.toString(),
        priceGold: place.priceGold,
        priceGems: place.priceGems
      })),
      connections
    };
  }

  @Get(':id/available-places')
  @UseGuards(LoggedIn)
  async getAvailablePlaces(@Param('id') playerId: string): Promise<AvailablePlacesResponseDto> {
    const player = await this.playersService.findOne(playerId);
    if (!player) {
      throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
    }

    const ownedPlaceInstancesPage = await this.placeInstancesService.findAllByPlayer({}, playerId);
    const ownedPlaceIds = ownedPlaceInstancesPage.data
      .map(pi => pi.placeId?.toString())
      .filter(id => id);

    const availablePlaces = await this.mapRevealService.getAvailablePlaces(playerId);

    return {
      places: availablePlaces.map(place => ({
        id: place._id?.toString(),
        name: place.name,
        description: place.description,
        type: place.type,
        lat: place.lat,
        lng: place.lng,
        gameId: place.gameId?.toString(),
        priceGold: place.priceGold,
        priceGems: place.priceGems
      })),
      ownedPlaceIds
    };
  }
}

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }]),
    TransactionsModule,
    PlaceInstancesModule,
    VehicleInstancesModule,
    PlaceConnectionsModule,
    PlacesModule
  ],
  controllers: [PlayerController],
  providers: [PlayersService, PlayerMapper, MapRevealService],
  exports: [PlayersService, PlayerMapper]
})
export class PlayersModule {}