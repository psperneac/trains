import { Controller, Get, Injectable, Module, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';

import { LoggedIn } from '../../authentication/authentication.guard';
import { PageDto } from '../../models/page.model';
import { PageRequestDto } from '../../models/pagination.model';
import { AbstractDto } from '../../utils/abstract-dto';
import { AbstractDtoMapper } from '../../utils/abstract-dto-mapper';
import { AbstractEntity } from '../../utils/abstract.entity';
import { AbstractServiceController } from '../../utils/abstract-service.controller';
import { AbstractService } from '../../utils/abstract.service';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../utils/repository-accessor';
import { GamesModule } from './games.module';

/**
 * Supported cargo types in the game.
 * Used by Job entities to specify what type of cargo is being transported.
 */
export const CargoTypes = [
  'Coal',
  'Grain',
  'Electronics',
  'Machinery',
  'Livestock',
  'Lumber',
  'Steel',
  'Textiles',
  'Food',
  'Chemicals',
  'Vehicles',
  'Minerals'
] as const;

/**
 * Type alias for cargo type values.
 */
export type CargoType = (typeof CargoTypes)[number];

@Entity({ name: 'vehicles' })
export class Vehicle extends AbstractEntity {
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

  @Column('int')
  @Expose()
  engineMax: number;

  @Column('int')
  @Expose()
  engineLoad: number;

  @Column('int')
  @Expose()
  engineFuel: number;

  @Column('int')
  @Expose()
  auxMax: number;

  @Column('int')
  @Expose()
  auxLoad: number;

  @Column('int')
  @Expose()
  auxFuel: number;

  @Column('int')
  @Expose()
  speed: number;

  @Column('objectId')
  gameId: ObjectId;

  @Column({ default: 5000 })
  @Expose()
  priceGold: number;

  @Column({ default: 10 })
  @Expose()
  priceGems: number;

  @Column({ default: 1 })
  @Expose()
  fuelBaseBurn: number;

  @Column({ default: 0.1 })
  @Expose()
  fuelPerLoadBurn: number;
}

export class VehicleDto implements AbstractDto {
  id: string;
  type: string;
  name: string;
  description: string;
  content: any;

  engineMax: number;
  engineLoad: number;
  engineFuel: number;

  auxMax: number;
  auxLoad: number;
  auxFuel: number;

  speed: number;
  gameId: string;
  priceGold: number;
  priceGems: number;
  fuelBaseBurn: number;
  fuelPerLoadBurn: number;
}

@Injectable()
export class VehicleRepository extends RepositoryAccessor<Vehicle> {
  constructor(@InjectRepository(Vehicle) private readonly injectedRepository) {
    super(injectedRepository);
  }
}

@Injectable()
export class VehiclesService extends AbstractService<Vehicle> {
  constructor(private readonly repo: VehicleRepository) {
    super(repo);
  }

  async findByGameId(gameId: string, pagination?: PageRequestDto): Promise<PageDto<Vehicle>> {
    return this.findAllWhere({ gameId: new Types.ObjectId(gameId) }, pagination);
  }
}

@Injectable()
export class VehicleMapper extends AbstractDtoMapper<Vehicle, VehicleDto> {
  constructor() {
    super();
  }

  async toDto(domain: Vehicle): Promise<VehicleDto> {
    if (!domain) {
      return null;
    }

    const dto: VehicleDto = {
      id: domain._id.toString(),
      type: domain.type,
      name: domain.name,
      description: domain.description,
      content: domain.content,
      engineMax: domain.engineMax,
      engineLoad: domain.engineLoad,
      engineFuel: domain.engineFuel,
      auxMax: domain.auxMax,
      auxLoad: domain.auxLoad,
      auxFuel: domain.auxFuel,
      speed: domain.speed,
      gameId: domain.gameId.toString(),
      priceGold: domain.priceGold,
      priceGems: domain.priceGems,
      fuelBaseBurn: domain.fuelBaseBurn,
      fuelPerLoadBurn: domain.fuelPerLoadBurn
    };

    return dto;
  }

  async toDomain(dto: VehicleDto, domain?: Partial<Vehicle> | Vehicle): Promise<Vehicle> {
    if (!dto) {
      return domain as any as Vehicle;
    }

    if (!domain) {
      domain = {};
    }

    const { gameId, ...fixedDto } = dto;

    return {
      ...domain,
      ...fixedDto,
      gameId: gameId ? new Types.ObjectId(gameId) : domain?.gameId
    } as any as Vehicle;
  }
}

@Controller('vehicles')
@UseFilters(AllExceptionsFilter)
export class VehiclesController extends AbstractServiceController<Vehicle, VehicleDto> {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly vehicleMapper: VehicleMapper
  ) {
    super(vehiclesService, vehicleMapper);
  }

  @Get('game/:gameId')
  @UseGuards(LoggedIn)
  async findByGameId(
    @Param('gameId') gameId: string,
    @Query() pagination: PageRequestDto
  ): Promise<PageDto<VehicleDto>> {
    const page = await this.vehiclesService.findByGameId(gameId, pagination);
    return this.handlePagedResults(page, this.vehicleMapper);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle]), GamesModule],
  controllers: [VehiclesController],
  providers: [VehicleMapper, VehiclesService, VehicleRepository],
  exports: [VehicleMapper, VehiclesService]
})
export class VehiclesModule {}
