import { Controller, Get, Injectable, Module, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';

import { Admin, LoggedIn } from '../../authentication/authentication.guard';
import { PageDto } from '../../models/page.model';
import { PageRequestDto } from '../../models/pagination.model';
import { AbstractDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../utils/abstract-service.controller';
import { AbstractService } from '../../utils/abstract.service';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../utils/repository-accessor';
import { User } from './support/users.module';

import { GameMapper, GamesModule, GamesService } from './games.module';
import { PlayerDto, PlayerMapper, PlayersModule, PlayersService } from './support/players.module';

export interface AdminUserDto {
  id: string;
  username: string;
  email: string;
  scope: string;
  preferences: any;
  created: Date;
  updated: Date;
  players?: (PlayerDto & { game?: any })[];
}

@Injectable()
export class AdminUsersRepository extends RepositoryAccessor<User> {
  constructor(@InjectRepository(User) injectRepository) {
    super(injectRepository);
  }
}

@Injectable()
export class AdminUserMapper extends AbstractDtoMapper<User, AdminUserDto> {
  getMappedProperties(): string[] {
    return ['id', 'username', 'email', 'scope', 'preferences', 'created', 'updated'];
  }
}

@Injectable()
export class AdminUsersService extends AbstractService<User> {
  constructor(
    private readonly repo: AdminUsersRepository,
    private readonly playersService: PlayersService,
    private readonly gamesService: GamesService,
    private readonly playerMapper: PlayerMapper,
    private readonly gameMapper: GameMapper
  ) {
    super(repo);
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
}

@Controller('admin')
@UseFilters(AllExceptionsFilter)
export class AdminUsersController extends AbstractServiceController<User, AdminUserDto> {
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
    TypeOrmModule.forFeature([User]),
    PlayersModule,
    GamesModule
  ],
  controllers: [AdminUsersController],
  providers: [AdminUsersService, AdminUserMapper, AdminUsersRepository],
  exports: [AdminUsersService]
})
export class AdminUsersModule {}
