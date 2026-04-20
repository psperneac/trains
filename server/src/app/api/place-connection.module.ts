import { Body, Controller, Delete, Get, Injectable, Module, Param, Post, Query, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { AbstractDto } from '../../utils/abstract-dto';
import { AbstractEntity } from '../../utils/abstract.entity';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

import { LoggedIn } from '../../authentication/authentication.guard';
import { PageDto } from '../../models/page.model';
import { PageRequestDto } from '../../models/pagination.model';
import { AbstractDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../utils/abstract-service.controller';
import { AbstractService } from '../../utils/abstract.service';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../utils/repository-accessor';

import { GamesModule } from './games.module';

import { ObjectId } from 'mongodb';
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

  @Column('objectid')
  @Expose()
  startId: ObjectId;

  @Column('objectid')
  @Expose()
  endId: ObjectId;

  @Column('objectid')
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

export class CopyPlaceConnectionsDto {
  @Expose()
  sourceGameId: string;

  @Expose()
  targetGameId: string;

  @Expose()
  overwrite: boolean;
}

export class CopyResultDto {
  @Expose()
  copiedCount: number;

  @Expose()
  skippedCount: number;

  @Expose()
  overwrittenCount: number;

  @Expose()
  errorCount: number;
}

@Injectable()
export class PlaceConnectionRepository extends RepositoryAccessor<PlaceConnection> {
  constructor(@InjectRepository(PlaceConnection) injectedRepo) {
    super(injectedRepo); // No relationships - using ObjectId columns directly
  }
}

@Injectable()
export class PlaceConnectionService extends AbstractService<PlaceConnection> {
  constructor(
    repo: PlaceConnectionRepository,
    private readonly placesService: PlacesService
  ) {
    super(repo);
  }

  async findByGameId(gameId: string, pagination?: PageRequestDto): Promise<PageDto<PlaceConnection>> {
    return this.findAllWhere({ gameId: new ObjectId(gameId) }, pagination);
  }

  async copyPlaceConnections(sourceGameId: string, targetGameId: string, overwrite: boolean): Promise<CopyResultDto> {
    // Copies place connections from source game to target game.
    // Connections are matched to places by name: for each source connection, we look up the
    // place names (start/end), then find those places in the target game to get their new IDs.
    // If a connection between the same two places exists in target, it either gets overwritten
    // (with overwrite=true) or is skipped (with overwrite=false).
    // Errors are logged but do not stop the process.
    // Returns counts of connections copied, overwritten, skipped, and failed.
    const sourceConnections = await this.repository.find({ where: { gameId: new ObjectId(sourceGameId) } });
    const targetConnections = await this.repository.find({ where: { gameId: new ObjectId(targetGameId) } });
    
    const targetConnectionsByRoute = new Map(
      targetConnections.map(c => [`${c.startId.toString()}-${c.endId.toString()}`, c])
    );

    const sourcePlacesResult = await this.placesService.findAllWhere({ gameId: new ObjectId(sourceGameId) });
    const sourcePlaceIdToName = new Map(sourcePlacesResult.data.map((p: any) => [p._id.toString(), p.name]));

    const targetPlacesResult = await this.placesService.findAllWhere({ gameId: new ObjectId(targetGameId) });
    const targetPlaceNameToId = new Map(targetPlacesResult.data.map((p: any) => [p.name, p._id.toString()]));

    let copiedCount = 0;
    let skippedCount = 0;
    let overwrittenCount = 0;
    let errorCount = 0;

    for (const connection of sourceConnections) {
      try {
        const startName = sourcePlaceIdToName.get(connection.startId.toString());
        const endName = sourcePlaceIdToName.get(connection.endId.toString());
        
        if (!startName || !endName) {
          skippedCount++;
          continue;
        }

        const targetStartId = targetPlaceNameToId.get(startName);
        const targetEndId = targetPlaceNameToId.get(endName);
        
        if (!targetStartId || !targetEndId) {
          skippedCount++;
          continue;
        }

        const routeKey = `${targetStartId}-${targetEndId}`;
        const existingConnection = targetConnectionsByRoute.get(routeKey);
        
        if (existingConnection) {
          if (overwrite) {
            existingConnection.name = connection.name;
            existingConnection.description = connection.description;
            existingConnection.type = connection.type;
            existingConnection.content = connection.content;
            await this.repository.save(existingConnection as any);
            overwrittenCount++;
          } else {
            skippedCount++;
          }
        } else {
          const newConnection = this.repository.create({
            type: connection.type,
            name: connection.name,
            description: connection.description,
            content: connection.content,
            startId: new ObjectId(targetStartId),
            endId: new ObjectId(targetEndId),
            gameId: new ObjectId(targetGameId),
          } as any);
          await this.repository.save(newConnection);
          copiedCount++;
        }
      } catch (error) {
        console.error(`Failed to copy connection "${connection.name}" (${connection.startId} -> ${connection.endId}):`, error.message);
        errorCount++;
      }
    }

    return {
      copiedCount,
      skippedCount,
      overwrittenCount,
      errorCount,
    };
  }

  async deleteAllByGameId(gameId: string): Promise<number> {
    const connections = await this.repository.find({ where: { gameId: new ObjectId(gameId) } });
    let deletedCount = 0;
    for (const connection of connections) {
      await this.repository.delete(connection._id);
      deletedCount++;
    }
    return deletedCount;
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
      startId: startId ? new ObjectId(startId) : domain?.startId,
      endId: endId ? new ObjectId(endId) : domain?.endId,
      gameId: gameId ? new ObjectId(gameId) : domain?.gameId,
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

  @Post('copy')
  @UseGuards(LoggedIn)
  async copyPlaceConnections(@Body() copyDto: CopyPlaceConnectionsDto): Promise<CopyResultDto> {
    return this.placeConnectionService.copyPlaceConnections(copyDto.sourceGameId, copyDto.targetGameId, copyDto.overwrite);
  }

  @Delete('game/:gameId')
  @UseGuards(LoggedIn)
  async deleteAllByGameId(@Param('gameId') gameId: string): Promise<number> {
    return this.placeConnectionService.deleteAllByGameId(gameId);
  }
}

@Module({
  imports: [PlacesModule, GamesModule, TypeOrmModule.forFeature([PlaceConnection])],
  controllers: [PlaceConnectionController],
  providers: [PlaceConnectionService, PlaceConnectionMapper, PlaceConnectionRepository],
  exports: [PlaceConnectionService, PlaceConnectionMapper]
})
export class PlaceConnectionsModule {}
