import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractService } from '../../../utils/abstract.service';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { UsersModule } from '../users/users.module';
import { Player2, Player2Dto } from './player2.entity';
import { UsersService } from '../users/users.service';
import { MapTemplateModule, MapTemplateService } from '../maps/map-template.module';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { WalletService, WalletModule } from './wallet.module';

@Injectable()
export class Player2Repository extends RepositoryAccessor<Player2> {
  constructor(@InjectRepository(Player2) injectedRepo) {
    super(injectedRepo, ['user', 'map', 'vehicles', 'places', 'placeConnections', 'wallet']);
  }
}

@Injectable()
export class Players2Service extends AbstractService<Player2> {
  constructor(repo: Player2Repository) {
    super(repo);
  }
}

@Injectable()
export class Player2Mapper extends AbstractDtoMapper<Player2, Player2Dto> {
  constructor(private readonly userService: UsersService, private readonly mapService: MapTemplateService) {
    super();
  }

  async toDto(domain: Player2): Promise<Player2Dto> {
    if (!domain) {
      return null;
    }
    console.log('Player - domain', domain);

    const dto: Player2Dto = {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      userId: domain.user?.id,
      mapId: domain.map?.id,
      walletId: domain.wallet?.id,
      vehicles: domain.vehicles?.map(v => v.id),
      places: domain.places?.map(p => p.id),
      placeConnections: domain.placeConnections?.map(p => p.id),
      content: domain.content
    };

    return dto;
  }

  async toDomain(dto: Player2Dto, domain?: Partial<Player2> | Player2): Promise<Player2> {
    if (!dto) {
      return domain as any as Player2;
    }

    if (!domain) {
      domain = {};
    }

    const userId = dto.userId ?? domain.user?.id;
    const mapId = dto.mapId ?? domain.map?.id;

    return {
      ...domain,
      name: dto.name,
      description: dto.description,
      user: userId ? await this.userService.getById(userId) : null,
      map: mapId ? await this.mapService.findOne(mapId) : null
    } as Player2;
  }
}

@Controller('players2')
@UseFilters(AllExceptionsFilter)
export class Player2Controller extends AbstractServiceController<Player2, Player2Dto> {
  constructor(service: Players2Service, mapper: Player2Mapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [UsersModule, MapTemplateModule, TypeOrmModule.forFeature([Player2])],
  controllers: [Player2Controller],
  providers: [Players2Service, Player2Mapper, Player2Repository],
  exports: [Players2Service]
})
export class Players2Module {}
