import { Body, Controller, Delete, Get, HttpException, HttpStatus, Injectable, Module, Param, Post, Query, Req, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { Column, Entity, ObjectId } from 'typeorm';
import { RequestWithUser } from '../../../authentication/authentication.model';

import { Types } from 'mongoose';
import { AbstractUserServiceController } from '../../../utils/abstract-user-service.controller';
import { Admin, LoggedIn, UserOrAdmin } from '../../../authentication/authentication.guard';
import { PageDto } from '../../../models/page.model';
import { PageRequestDto } from '../../../models/pagination.model';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { EntityType, TransactionType, TransactionsModule, TransactionsService } from './transactions.module';
import { User } from './users.module';
import { Wallet, WalletDto, SendGoldAndGemsDto } from './wallet.model';
import { PlaceInstancesModule, PlaceInstanceMapper, PlaceInstancesService } from '../place-instance.module';
import { VehicleInstancesModule, VehicleInstanceMapper, VehicleInstancesService } from '../vehicle-instances.module';
import { PlaceConnectionService, PlaceConnectionDto, PlaceConnectionsModule } from '../place-connection.module';
import { PlacesModule } from '../places.module';
import { MapRevealService } from '../../game/map-reveal/map-reveal.service';

export { Wallet, WalletDto, SendGoldAndGemsDto };

@Entity({ name: 'players' })
export class Player extends AbstractEntity {
  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;

  @Column('objectId')
  @Expose()
  userId: ObjectId;

  @Column('objectId')
  @Expose()
  gameId: ObjectId;

  @Column({ type: 'json' })
  @Expose()
  wallet: Wallet;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface PlayerDto {
  id: string;
  name: string;
  description: string;
  userId: string;
  gameId: string;
  wallet?: WalletDto;
  content: any;
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
  owned: any[];           // PlaceInstance objects with jobOffers populated
  available: any[];       // Place template objects with priceGold/priceGems
  connections: PlaceConnectionDto[];  // All connections in the game (filtered by proximity)
}

/**
 * Response DTO for available places endpoint.
 * Returns only the places available for purchase by the player.
 */
export interface AvailablePlacesResponseDto {
  places: any[];          // Place template objects with priceGold/priceGems
  ownedPlaceIds: string[]; // IDs of places the player already owns (for reference)
}

@Injectable()
export class PlayerRepository extends RepositoryAccessor<Player> {
  constructor(@InjectRepository(Player) injectedRepo) {
    super(injectedRepo);
  }

}

@Injectable()
export class PlayersService extends AbstractService<Player> {
  constructor(repo: PlayerRepository) {
    super(repo);
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

    // Update wallet
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
export class PlayerMapper extends AbstractDtoMapper<Player, PlayerDto> {
  constructor() {
    super();
  }

  async toDto(domain: Player, currentUser?: User): Promise<PlayerDto> {
    if (!domain) {
      return null;
    }

    const dto: PlayerDto = {
      id: domain._id.toString(),
      name: domain.name,
      description: domain.description,
      userId: domain.userId?.toString(),
      gameId: domain.gameId?.toString(),
      content: domain.content
    };

    // Handle wallet visibility based on user permissions
    if (!currentUser || !this.shouldIncludeWallet(domain, currentUser)) {
      dto.wallet = undefined;
    } else {
      dto.wallet = { ...domain.wallet } as WalletDto;
    }

    return dto;
  }

  private shouldIncludeWallet(player: Player, currentUser?: User): boolean {
    if (!currentUser) {
      return false;
    }

    // Admin can see all wallets
    if (currentUser.scope === 'ADMIN') {
      return true;
    }

    // User can only see their own wallet
    if (currentUser.scope === 'USER') {
      return currentUser._id.toString() === player.userId?.toString();
    }

    return false;
  }

  async toDomain(dto: PlayerDto, domain?: Partial<Player> | Player): Promise<Player> {
    if (!dto) {
      return domain as any as Player;
    }

    if (!domain) {
      domain = {};
    }

    return {
      ...domain,
      name: dto.name,
      description: dto.description,
      userId: dto.userId ? new Types.ObjectId(dto.userId) : domain?.userId,
      gameId: dto.gameId ? new Types.ObjectId(dto.gameId) : domain?.gameId,
      wallet: { ...dto.wallet } as Wallet,
      content: dto.content,
    } as Player;
  }
}

@Controller('players')
@UseFilters(AllExceptionsFilter)
export class PlayerController extends AbstractUserServiceController<Player, PlayerDto> {
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
    @Query() pagination: PageRequestDto
  ): Promise<PageDto<PlayerDto>> {
    return this.playersService.findAllByUserId(userId, pagination).then(this.makeHandler());
  }

  @Delete(':id')
  @UseGuards(LoggedIn, UserOrAdmin)
  async delete(@Param('id') id: string, @Req() request: RequestWithUser): Promise<{ success: boolean }> {
    const currentUser = request.user;
    const canDeleteResult = this.canDelete(id, currentUser);
    const isAllowed = canDeleteResult instanceof Promise ? await canDeleteResult : canDeleteResult;

    if (!isAllowed) {
      throw new HttpException('Delete operation not allowed', HttpStatus.FORBIDDEN);
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
    // User might not be in request if not authenticated, handle gracefully
    const currentUser = request.user || undefined;

    return this.playersService.findAllByGameId(gameId, pagination).then(
      this.makeHandlerWithUser(currentUser)
    );
  }

  /**
   * Custom handler that passes current user context to the mapper for wallet visibility
   */
  private makeHandlerWithUser(currentUser?: User) {
    return (page: PageDto<Player>) => this.handlePagedResultsWithUser(page, currentUser);
  }

  private async handlePagedResultsWithUser(page: PageDto<Player>, currentUser?: User): Promise<PageDto<PlayerDto>> {
    const mappedData = await Promise.all(
      page?.data?.map(item => this.playersMapper.toDto(item, currentUser)) || []
    );

    return {
      ...page,
      data: mappedData
    };
  }

  @Post('send')
  @UseGuards(LoggedIn, Admin)
  async sendGoldAndGems(
    @Body() sendDto: SendGoldAndGemsDto,
    @Req() request: RequestWithUser
  ): Promise<PlayerDto> {
    const currentUser = request.user;

    // Create transaction record first
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

  /**
   * Allow users to delete their own players, and admins to delete any player.
   */
  protected async canDelete(playerId: string, currentUser: User): Promise<boolean> {
    // Admins can delete any player
    if (currentUser.scope === 'ADMIN') {
      return true;
    }
    // Users can only delete their own player
    const player = await this.playersService.findOne(playerId);
    if (!player) {
      return false;
    }
    return player.userId?.toString() === currentUser._id.toString();
  }

  /**
   * GET /players/:id/full-state
   * Returns the complete state of a player including all place instances and vehicle instances.
   * Useful for debugging and verifying data flow before map view implementation.
   */
  @Get(':id/full-state')
  @UseGuards(LoggedIn)
  async getFullState(@Param('id') playerId: string): Promise<PlayerFullStateDto> {
    // Fetch the player
    const player = await this.playersService.findOne(playerId);
    if (!player) {
      throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
    }

    // Convert player to DTO
    const playerDto = await this.playersMapper.toDto(player);

    // Fetch all place instances for this player (no pagination for full state)
    const placeInstancesPage = await this.placeInstancesService.findAllByPlayer({}, playerId);
    const placeInstances = await Promise.all(
      placeInstancesPage.data.map(pi => this.placeInstanceMapper.toDto(pi))
    );

    // Fetch all vehicle instances for this player (no pagination for full state)
    const vehicleInstancesPage = await this.vehicleInstancesService.findAllByPlayer({}, playerId);
    const vehicleInstances = await Promise.all(
      vehicleInstancesPage.data.map(vi => this.vehicleInstanceMapper.toDto(vi))
    );

    return {
      player: playerDto,
      placeInstances,
      vehicleInstances
    };
  }

  /**
   * GET /players/:id/map-view
   * Returns the map view for a player including:
   * - owned: PlaceInstance objects with jobOffers populated (places the player owns)
   * - available: Place template objects with priceGold/priceGems (places available for purchase)
   * - connections: PlaceConnection objects for the game's places (filtered to relevant ones)
   */
  @Get(':id/map-view')
  @UseGuards(LoggedIn)
  async getMapView(@Param('id') playerId: string): Promise<MapViewResponseDto> {
    // Fetch the player to verify they exist and get their gameId
    const player = await this.playersService.findOne(playerId);
    if (!player) {
      throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
    }

    // Get owned place instances
    const ownedPlaceInstancesPage = await this.placeInstancesService.findAllByPlayer({}, playerId);
    const ownedPlaceInstances = await Promise.all(
      ownedPlaceInstancesPage.data.map(pi => this.placeInstanceMapper.toDto(pi))
    );

    // Get available places (templates) for purchase
    const availablePlaces = await this.mapRevealService.getAvailablePlaces(playerId);

    // Get the player's owned place IDs to include in response for reference
    const ownedPlaceIds = ownedPlaceInstances
      .map(pi => pi.placeId)
      .filter(id => id);

    // Get connections for the player's game
    // Filter connections to only those involving owned or available places
    const gameId = player.gameId;
    const allConnectionsPage = await this.placeConnectionService.findAllWhere(
      { gameId: new Types.ObjectId(gameId.toString()) } as any,
      { page: 1, pageSize: 1000 } as any
    );

    // Filter connections to only those relevant to the player's map view
    // (connections where startId or endId is in owned or available places)
    const relevantPlaceIds = new Set([
      ...ownedPlaceIds,
      ...availablePlaces.map(p => p._id?.toString()).filter(id => id)
    ]);

    const relevantConnections = allConnectionsPage.data.filter(conn => {
      const startId = conn.startId?.toString();
      const endId = conn.endId?.toString();
      return relevantPlaceIds.has(startId) || relevantPlaceIds.has(endId);
    });

    // Map connections to DTOs
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

  /**
   * GET /players/:id/available-places
   * Returns only the places available for purchase by the player.
   * Useful for dedicated UI components showing available purchases.
   */
  @Get(':id/available-places')
  @UseGuards(LoggedIn)
  async getAvailablePlaces(@Param('id') playerId: string): Promise<AvailablePlacesResponseDto> {
    // Verify player exists
    const player = await this.playersService.findOne(playerId);
    if (!player) {
      throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
    }

    // Get owned place instances to get the list of owned place IDs
    const ownedPlaceInstancesPage = await this.placeInstancesService.findAllByPlayer({}, playerId);
    const ownedPlaceIds = ownedPlaceInstancesPage.data
      .map(pi => pi.place?._id?.toString())
      .filter(id => id);

    // Get available places (templates) for purchase
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
    TypeOrmModule.forFeature([Player]),
    TransactionsModule,
    PlaceInstancesModule,
    VehicleInstancesModule,
    PlaceConnectionsModule,
    PlacesModule
  ],
  controllers: [PlayerController],
  providers: [PlayersService, PlayerMapper, PlayerRepository, MapRevealService],
  exports: [PlayersService, PlayerMapper]
})
export class PlayersModule {}
