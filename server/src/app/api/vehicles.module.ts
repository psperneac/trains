import { Controller, Get, Injectable, Module, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { Column, Entity } from 'typeorm';

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

  @Column('int', { name: 'engine_max' })
  @Expose()
  engineMax: number;

  @Column('int', { name: 'engine_load' })
  @Expose()
  engineLoad: number;

  @Column('int', { name: 'engine_fuel' })
  @Expose()
  engineFuel: number;

  @Column('int', { name: 'aux_max' })
  @Expose()
  auxMax: number;

  @Column('int', { name: 'aux_load' })
  @Expose()
  auxLoad: number;

  @Column('int', { name: 'aux_fuel' })
  @Expose()
  auxFuel: number;

  @Column('int')
  @Expose()
  speed: number;

  @Column()
  gameId: string;
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
    return this.findAllWhere({ gameId }, pagination);
  }
}

@Injectable()
export class VehicleMapper extends AbstractDtoMapper<Vehicle, VehicleDto> {
  getMappedProperties(): string[] {
    return [
      'id',
      'type',
      'name',
      'description',
      'content',
      'engineMax',
      'engineLoad',
      'engineFuel',
      'auxMax',
      'auxLoad',
      'auxFuel',
      'speed',
      'gameId'
    ];
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
