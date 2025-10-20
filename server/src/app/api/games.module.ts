import { Controller, Get, Injectable, Module, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { LoggedIn } from 'src/authentication/authentication.guard';
import { PageDto } from 'src/models/page.model';
import { PageRequestDto } from 'src/models/pagination.model';
import { AbstractDtoMapper } from 'src/utils/abstract-dto-mapper';
import { AbstractServiceController } from 'src/utils/abstract-service.controller';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { AbstractService } from 'src/utils/abstract.service';
import { AllExceptionsFilter } from 'src/utils/all-exceptions.filter';
import { RepositoryAccessor } from 'src/utils/repository-accessor';
import { Column, Entity } from 'typeorm';

export enum GameType {
  TEMPLATE = 'TEMPLATE',
  GAME = 'GAME'
}

@Entity({ name: 'games'})
export class Game extends AbstractEntity {
  @Column()
  @Expose()
  name: string;

  @Column()
  @Expose()
  description: string;

  @Column()
  @Expose()
  type: GameType;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface GameDto {
  id: string;
  name: string;
  description: string;
  type: GameType;
  content: any;
}

@Injectable()
export class GameRepository extends RepositoryAccessor<Game> {
  constructor(@InjectRepository(Game) injectedRepo) {
    super(injectedRepo);
  }
}

@Injectable()
export class GamesService extends AbstractService<Game> {
  constructor(private readonly repo: GameRepository) {
    super(repo);
  }

  async findByType(type: GameType, pagination?: PageRequestDto): Promise<PageDto<Game>> {
    return this.findAllWhere({ type }, pagination);
  }
}

@Injectable()
export class GameMapper extends AbstractDtoMapper<Game, GameDto> {
  constructor() {
    super();
  }

  async toDto(domain: Game): Promise<GameDto> {
    if (!domain) {
      return null;
    }

    const dto: GameDto = {
      id: domain._id.toString(),
      name: domain.name,
      description: domain.description,
      type: domain.type,
      content: domain.content
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
      ...dto
    } as Game;
  }
}

@Controller('games')
@UseFilters(AllExceptionsFilter)
export class GamesController extends AbstractServiceController<Game, GameDto> {
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
}

@Module({
  imports: [TypeOrmModule.forFeature([Game])],
  controllers: [GamesController],
  providers: [GamesService, GameMapper, GameRepository],
  exports: [GamesService, GameMapper]
})
export class GamesModule {}