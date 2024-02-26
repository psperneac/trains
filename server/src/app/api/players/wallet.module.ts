import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { PlayersModule, PlayersService } from './player.module';
import { Wallet, WalletDto } from './wallet.entity';

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
      id: domain.id,
      name: domain.name,
      description: domain.description,
      playerId: domain.player?.id,
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

    const playerId = dto.playerId ?? domain.player?.id;

    return {
      ...domain,
      id: dto.id,
      name: dto.name,
      description: dto.description,
      gold: dto.gold,
      gems: dto.gems,
      parts: dto.parts,
      player: this.playersService.findOne(playerId),
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
