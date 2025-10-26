import { Body, Controller, Get, Injectable, Module, Param, Post, Query, Req, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { Column, Entity, ObjectId } from 'typeorm';
import { RequestWithUser } from '../../../authentication/authentication.model';

import { Types } from 'mongoose';
import { AbstractUserServiceController } from 'src/utils/abstract-user-service.controller';
import { Admin, LoggedIn } from '../../../authentication/authentication.guard';
import { PageDto } from '../../../models/page.model';
import { PageRequestDto } from '../../../models/pagination.model';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { EntityType, TransactionType, TransactionsModule, TransactionsService } from './transactions.module';
import { User } from './users.module';

export class Wallet {
  @Column('integer')
  @Expose()
  gold = 0;

  @Column('integer')
  @Expose()
  gems = 0;

  @Column('integer')
  @Expose()
  parts = 0;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface WalletDto {
  id: string;
  gold: number;
  gems: number;
  parts: number;
  content: any;
}

export class SendGoldAndGemsDto {
  playerId: string;
  gold: number;
  gems: number;
  parts: number;
}

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
    private readonly transactionsService: TransactionsService) {
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
    console.log(`Admin ${currentUser.username} (${currentUser._id}) sending ${sendDto.gold} gold, ${sendDto.gems} gems, and ${sendDto.parts} parts to player ${sendDto.playerId}`);

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

}

@Module({
  imports: [TypeOrmModule.forFeature([Player]), TransactionsModule],
  controllers: [PlayerController],
  providers: [PlayersService, PlayerMapper, PlayerRepository],
  exports: [PlayersService]
})
export class PlayersModule {}
