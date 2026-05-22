import { Body, Controller, Get, HttpException, HttpStatus, Injectable, Module, Param, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { Admin, LoggedIn } from '../../authentication/authentication.guard';
import { PageDto } from '../../models/page.model';
import { PageRequestDto } from '../../models/pagination.model';
import { AbstractMongoDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractMongoService } from '../../utils/abstract-mongo.service';
import { AbstractMongoServiceController } from '../../utils/abstract-mongo-service.controller';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { User, UserSchema, UserDocument } from './support/users.module';
import { WalletDto } from './support/wallet.model';

import { GameMapper, GamesModule, GamesService } from './games.module';
import { PlayerDto, PlayerMapper, PlayersModule, PlayersService } from './support/players.module';

export class ResetPasswordDto {
  newPassword: string;
}

export class SendGoldAndGemsDto {
  userId: string;
  gold: number;
  gems: number;
  parts: number;
}

export interface AdminUserDto {
  id: string;
  username: string;
  email: string;
  scope: string;
  preferences: any;
  wallet?: WalletDto;
  created: Date;
  updated: Date;
  players?: (PlayerDto & { game?: any })[];
}

@Injectable()
export class AdminUserMapper extends AbstractMongoDtoMapper<User, AdminUserDto> {
  getMappedProperties(): string[] {
    return ['id', 'username', 'email', 'scope', 'preferences', 'created', 'updated'];
  }

  async toDto(domain: User): Promise<AdminUserDto> {
    if (!domain) {
      return null;
    }
    const dto = await super.toDto(domain);
    if (dto && domain.wallet) {
      dto.wallet = { ...domain.wallet } as WalletDto;
    }
    return dto;
  }
}

@Injectable()
export class AdminUsersService extends AbstractMongoService<User> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly playersService: PlayersService,
    private readonly gamesService: GamesService,
    private readonly playerMapper: PlayerMapper,
    private readonly gameMapper: GameMapper
  ) {
    super(userModel);
  }

  async enrichUserWithData(dto: AdminUserDto, user: User): Promise<AdminUserDto> {
    const playersPage = await this.playersService.findAllByUserId(user._id.toString());
    
    dto.players = await Promise.all(playersPage.data.map(async (player) => {
      const playerDto = await this.playerMapper.toDto(player, user) as any;
      if (player.gameId) {
        const game = await this.gamesService.findOne(player.gameId.toString());
        playerDto.game = await this.gameMapper.toDto(game);
      }
      return playerDto;
    }));

    return dto;
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (user.scope === 'ADMIN') {
      throw new HttpException('Cannot reset password for an admin user', HttpStatus.FORBIDDEN);
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true }).exec();
  }

  async sendGoldAndGems(userId: string, gold: number, gems: number, parts: number): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const currentGold = typeof user.wallet?.gold === 'number' && !isNaN(user.wallet.gold) ? user.wallet.gold : 0;
    const currentGems = typeof user.wallet?.gems === 'number' && !isNaN(user.wallet.gems) ? user.wallet.gems : 0;
    const currentParts = typeof user.wallet?.parts === 'number' && !isNaN(user.wallet.parts) ? user.wallet.parts : 0;

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        wallet: {
          gold: currentGold + gold,
          gems: currentGems + gems,
          parts: currentParts + parts,
          content: user.wallet?.content ?? {},
        },
      },
      { new: true }
    ).exec();

    if (!updatedUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const plain = updatedUser.toObject();
    return { ...plain, id: plain._id?.toString() } as User;
  }
}

@Controller('admin')
@UseFilters(AllExceptionsFilter)
export class AdminUsersController extends AbstractMongoServiceController<User, AdminUserDto> {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly adminUserMapper: AdminUserMapper
  ) {
    super(adminUsersService, adminUserMapper);
  }

  @Get('users')
  @UseGuards(LoggedIn, Admin)
  async getAdminUsers(@Query() pagination: PageRequestDto): Promise<PageDto<AdminUserDto>> {
    const page = await this.adminUsersService.findAll(pagination);
    return this.handlePagedResultsEnriched(page);
  }

  @Get('user/:userId')
  @UseGuards(LoggedIn, Admin)
  async getAdminUser(@Param('userId') userId: string): Promise<AdminUserDto> {
    const user = await this.adminUsersService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const userDto = await this.adminUserMapper.toDto(user);
    return this.adminUsersService.enrichUserWithData(userDto, user);
  }

  @Post('user/:userId/reset-password')
  @UseGuards(LoggedIn, Admin)
  async resetPassword(
    @Param('userId') userId: string,
    @Body() resetDto: ResetPasswordDto
  ): Promise<{ message: string }> {
    await this.adminUsersService.resetPassword(userId, resetDto.newPassword);
    return { message: 'Password reset successfully' };
  }

  @Post('user/:userId/send')
  @UseGuards(LoggedIn, Admin)
  async sendGoldAndGems(
    @Param('userId') userId: string,
    @Body() sendDto: SendGoldAndGemsDto
  ): Promise<AdminUserDto> {
    const user = await this.adminUsersService.sendGoldAndGems(userId, sendDto.gold, sendDto.gems, sendDto.parts);
    const userDto = await this.adminUserMapper.toDto(user);
    return this.adminUsersService.enrichUserWithData(userDto, user);
  }

  private async handlePagedResultsEnriched(page: PageDto<User>): Promise<PageDto<AdminUserDto>> {
    const mappedData = await Promise.all(page.data.map(async (user) => {
      const userDto = await this.adminUserMapper.toDto(user);
      return this.adminUsersService.enrichUserWithData(userDto, user);
    }));

    return {
      ...page,
      data: mappedData
    };
  }
}

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PlayersModule,
    GamesModule
  ],
  controllers: [AdminUsersController],
  providers: [AdminUsersService, AdminUserMapper],
  exports: [AdminUsersService]
})
export class AdminUsersModule {}
