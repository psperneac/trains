import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { Column, Entity, ObjectId } from 'typeorm';

import { Types } from 'mongoose';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';

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

  @Column('objectId')
  @Expose()
  walletId: ObjectId;

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
  walletId: string;
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
      userId: domain.userId.toString(),
      gameId: domain.gameId?.toString(),
      walletId: domain.walletId.toString(),
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
      userId: dto.userId ? new Types.ObjectId(dto.userId) : domain?.userId,
      gameId: dto.gameId ? new Types.ObjectId(dto.gameId) : domain?.gameId,
      walletId: dto.walletId ? new Types.ObjectId(dto.walletId) : domain?.walletId,
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
  imports: [TypeOrmModule.forFeature([Player])],
  controllers: [PlayerController],
  providers: [PlayersService, PlayerMapper, PlayerRepository],
  exports: [PlayersService]
})
export class PlayersModule {}
