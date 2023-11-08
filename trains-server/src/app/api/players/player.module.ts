import { Controller, Injectable, UseFilters } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractService } from '../../../utils/abstract.service';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { Player, PlayerDto } from './player.entity';
import { UsersService } from '../users/users.service';
import { MapTemplateService } from '../maps/map-template.module';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';

@Injectable()
export class PlayerRepository extends RepositoryAccessor<Player> {
  constructor(@InjectRepository(Player) injectedRepo) {
    super(injectedRepo, ['user', 'map', 'vehicles', 'places', 'placeConnections']);
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
  constructor(private readonly userService: UsersService, private readonly mapService: MapTemplateService) {
    super();
  }

  async toDto(domain: Player): Promise<PlayerDto> {
    if (!domain) {
      return null;
    }

    const dto: PlayerDto = {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      userId: domain.user?.id,
      mapId: domain.map?.id,
      vehicles: domain.vehicles?.map(v => v.id),
      places: domain.places?.map(p => p.id),
      placeConnections: domain.placeConnections?.map(p => p.id),
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

    const userId = dto.userId ?? domain.user?.id;
    const mapId = dto.mapId ?? domain.map?.id;

    return {
      ...domain,
      name: dto.name,
      description: dto.description,
      user: userId ? await this.userService.getById(userId) : null,
      map: mapId ? await this.mapService.findOne(mapId) : null
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
