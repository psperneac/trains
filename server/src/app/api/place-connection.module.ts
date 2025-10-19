import { Controller, Get, Injectable, Module, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { AbstractDto } from 'src/utils/abstract-dto';
import { AbstractEntity } from 'src/utils/abstract.entity';
import { Column, Entity, ObjectId } from 'typeorm';

import { LoggedIn } from '../../authentication/authentication.guard';
import { PageDto } from '../../models/page.model';
import { PageRequestDto } from '../../models/pagination.model';
import { AbstractDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../utils/abstract-service.controller';
import { AbstractService } from '../../utils/abstract.service';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../utils/repository-accessor';

import { GamesModule } from './games.module';

import { Types } from 'mongoose';
import { PlacesModule, PlacesService } from './places.module';

@Entity({ name: 'place_connections' })
export class PlaceConnection extends AbstractEntity {
  @Column('varchar', { length: 20 })
  @Expose()
  type: string;

  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;

  @Column({ type: 'json' })
  @Expose()
  content: any;

  @Column('objectId')
  @Expose()
  startId: ObjectId;

  @Column('objectId')
  @Expose()
  endId: ObjectId;

  @Column('objectId')
  @Expose()
  gameId: ObjectId;
}

export class PlaceConnectionDto implements AbstractDto {
  id: string;
  type: string;
  name: string;
  description: string;
  content: any;

  startId: string;
  endId: string;
  gameId: string;
}

@Injectable()
export class PlaceConnectionRepository extends RepositoryAccessor<PlaceConnection> {
  constructor(@InjectRepository(PlaceConnection) injectedRepo) {
    super(injectedRepo); // No relationships - using ObjectId columns directly
  }
}

@Injectable()
export class PlaceConnectionService extends AbstractService<PlaceConnection> {
  constructor(repo: PlaceConnectionRepository) {
    super(repo);
  }

  async findByGameId(gameId: string, pagination?: PageRequestDto): Promise<PageDto<PlaceConnection>> {
    return this.findAllWhere({ gameId }, pagination);
  }
}

@Injectable()
export class PlaceConnectionMapper extends AbstractDtoMapper<PlaceConnection, PlaceConnectionDto> {
  constructor(private readonly service: PlacesService) {
    super();
  }

  async toDto(domain: PlaceConnection): Promise<PlaceConnectionDto> {
    if (!domain) {
      return null;
    }

    const dto: PlaceConnectionDto = {
      id: domain._id.toString(),
      type: domain.type,
      name: domain.name,
      description: domain.description,
      content: domain.content,
      startId: domain.startId.toString(),
      endId: domain.endId.toString(),
      gameId: domain.gameId.toString(),
    };

    return dto;
  }

  async toDomain(
    dto: PlaceConnectionDto,
    domain?: Partial<PlaceConnection> | PlaceConnection
  ): Promise<PlaceConnection> {
    if (!dto) {
      return domain as any as PlaceConnection;
    }

    if (!domain) {
      domain = {};
    }

    // Use DTO values if provided, otherwise keep domain values
    const { startId, endId, gameId, ...fixedDto } = dto;

    return {
      ...domain,
      ...fixedDto,
      startId: startId ? new Types.ObjectId(startId) : domain?.startId,
      endId: endId ? new Types.ObjectId(endId) : domain?.endId,
      gameId: gameId ? new Types.ObjectId(gameId) : domain?.gameId,
    } as any as PlaceConnection;
  }
}

@Controller('place-connections')
@UseFilters(AllExceptionsFilter)
export class PlaceConnectionController extends AbstractServiceController<PlaceConnection, PlaceConnectionDto> {
  constructor(
    private readonly placeConnectionService: PlaceConnectionService,
    private readonly placeConnectionMapper: PlaceConnectionMapper
  ) {
    super(placeConnectionService, placeConnectionMapper);
  }

  @Get('game/:gameId')
  @UseGuards(LoggedIn)
  async findByGameId(
    @Param('gameId') gameId: string,
    @Query() pagination: PageRequestDto
  ): Promise<PageDto<PlaceConnectionDto>> {
    const page = await this.placeConnectionService.findByGameId(gameId, pagination);
    return this.handlePagedResults(page, this.placeConnectionMapper);
  }
}

@Module({
  imports: [PlacesModule, GamesModule, TypeOrmModule.forFeature([PlaceConnection])],
  controllers: [PlaceConnectionController],
  providers: [PlaceConnectionService, PlaceConnectionMapper, PlaceConnectionRepository],
  exports: [PlaceConnectionService, PlaceConnectionMapper]
})
export class PlaceConnectionsModule {}
