import { Controller, Get, Injectable, Module, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { LoggedIn } from '../../authentication/authentication.guard';
import { PageDto } from '../../models/page.model';
import { PageRequestDto } from '../../models/pagination.model';
import { AbstractDtoMapper } from '../../utils/abstract-dto-mapper';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractMongoEntity } from '../../utils/abstract-mongo.entity';
import { HydratedDocument, Model } from 'mongoose';
import { AbstractMongoService } from '../../utils/abstract-mongo.service';
import { AbstractMongoServiceController } from '../../utils/abstract-mongo-service.controller';

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
}

export type GameDocument = HydratedDocument<Game>;
export const GameSchema = SchemaFactory.createForClass(Game);

export interface GameDto {
  id: string;
  name: string;
  description: string;
  type: GameType;
  content: any;
}

@Injectable()
export class GamesService extends AbstractMongoService<Game> {
  constructor(@InjectModel(Game.name) private readonly gameModel: Model<GameDocument>) {
    super(gameModel);
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
      id: (domain as any).id || (domain as any)._id?.toString(),
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
}

@Module({
  imports: [MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }])],
  controllers: [GamesController],
  providers: [GamesService, GameMapper],
  exports: [GamesService, GameMapper, MongooseModule]
})
export class GamesModule {}