import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';

import { Player, PlayersModule, PlayersService } from './players.module';

@Entity({ name: 'wallets' })
export class Wallet extends AbstractEntity {
  @OneToOne(_type => Player, player => player.wallet)
  @JoinColumn({ name: 'player_id' })
  @Expose()
  player: Player;

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
  playerId: string;
  gold: number;
  gems: number;
  parts: number;
  content: any;
}

@Injectable()
export class WalletRepository extends RepositoryAccessor<Wallet> {
  constructor(@InjectRepository(Wallet) injectedRepo) {
    super(injectedRepo, ['player']);
  }
}

@Injectable()
export class WalletService extends AbstractService<Wallet> {
  constructor(repo: WalletRepository) {
    super(repo);
  }
}

@Injectable()
export class WalletMapper extends AbstractDtoMapper<Wallet, WalletDto> {
  constructor(private readonly playersService: PlayersService) {
    super();
  }

  async toDto(domain: Wallet): Promise<WalletDto> {
    if (!domain) {
      return null;
    }

    const dto: WalletDto = {
      id: domain._id.toString(),
      playerId: domain.player?._id.toString(),
      gold: domain.gold,
      gems: domain.gems,
      parts: domain.parts,
      content: domain.content
    };

    return dto;
  }

  async toDomain(dto: WalletDto, domain?: Partial<Wallet> | Wallet): Promise<Wallet> {
    if (!dto) {
      return domain as any as Wallet;
    }

    if (!domain) {
      domain = {};
    }

    const playerId = dto.playerId ?? domain.player?._id.toString();
    console.log('playerId', playerId);

    return {
      ...domain,
      _id: dto.id,
      gold: dto.gold,
      gems: dto.gems,
      parts: dto.parts,
      player: await this.playersService.findOne(playerId),
      content: dto.content
    } as any as Wallet;
  }
}

@Controller('wallets')
@UseFilters(AllExceptionsFilter)
export class WalletController extends AbstractServiceController<Wallet, WalletDto> {
  constructor(service: WalletService, mapper: WalletMapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [PlayersModule, TypeOrmModule.forFeature([Wallet])],
  controllers: [WalletController],
  providers: [WalletService, WalletMapper, WalletRepository],
  exports: [WalletService]
})
export class WalletModule {}
