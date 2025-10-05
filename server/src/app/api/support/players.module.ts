import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { PlaceInstance } from '../place-instance.module';
import { User, UsersModule, UsersService } from './users.module';
import { VehicleInstance } from '../vehicle-instances.module';
import { Wallet } from './wallets.module';

@Entity({ name: 'players' })
export class Player extends AbstractEntity {
  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;

  @Column()
  userId: string;

  @OneToMany(_type => VehicleInstance, vehicleInstance => vehicleInstance.playerId)
  @Expose()
  vehicles: VehicleInstance[];

  @OneToMany(_type => PlaceInstance, placeInstance => placeInstance.playerId)
  @Expose()
  places: PlaceInstance[];

  @Column()
  walletId: string;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface PlayerDto {
  id: string;
  name: string;
  description: string;
  walletId: string;
  userId: string;
  vehicles: string[];
  places: string[];
  content: any;
}

@Injectable()
export class PlayerRepository extends RepositoryAccessor<Player> {
  constructor(@InjectRepository(Player) injectedRepo) {
    super(injectedRepo, ['user', 'vehicles', 'places']);
  }
}

@Injectable()
export class PlayersService extends AbstractService<Player> {
  constructor(repo: PlayerRepository) {
    super(repo);
  }
}

@Injectable()
export class PlayerMapper extends AbstractDtoMapper<Player, PlayerDto> {
  constructor() {
    super();
  }

  async toDto(domain: Player): Promise<PlayerDto> {
    if (!domain) {
      return null;
    }
    console.log('Player - domain', domain);

    const dto: PlayerDto = {
      id: domain._id.toString(),
      name: domain.name,
      description: domain.description,
      userId: domain.userId,
      walletId: domain.walletId,
      vehicles: domain.vehicles?.map(v => v._id.toString()),
      places: domain.places?.map(p => p._id.toString()),
      content: domain.content
    };

    return dto;
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
      userId: dto.userId,
    } as Player;
  }
}

@Controller('players')
@UseFilters(AllExceptionsFilter)
export class PlayerController extends AbstractServiceController<Player, PlayerDto> {
  constructor(service: PlayersService, mapper: PlayerMapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Player])],
  controllers: [PlayerController],
  providers: [PlayersService, PlayerMapper, PlayerRepository],
  exports: [PlayersService]
})
export class PlayersModule {}
