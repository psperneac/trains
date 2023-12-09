import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { PlayersModule, PlayersService } from '../players/player.module';
import { PlaceConnectionInstance, PlaceConnectionInstanceDto } from './place-connection-instance.entity';
import { PlaceConnectionService, PlaceConnectionsModule } from './place-connection.module';

@Injectable()
export class PlaceConnectionInstanceRepository extends RepositoryAccessor<PlaceConnectionInstance> {
  constructor(@InjectRepository(PlaceConnectionInstance) injectedRepo) {
    super(injectedRepo, ['placeConnection', 'player']);
  }
}

@Injectable()
export class PlaceConnectionInstanceService extends AbstractService<PlaceConnectionInstance> {
  constructor(repo: PlaceConnectionInstanceRepository) {
    super(repo);
  }
}

@Injectable()
export class PlaceConnectionInstanceMapper extends AbstractDtoMapper<PlaceConnectionInstance, PlaceConnectionInstanceDto> {
  constructor(private readonly placeConnectionService: PlaceConnectionService,
              private readonly playersService: PlayersService) {
    super();
  }

  async toDto(domain: PlaceConnectionInstance): Promise<PlaceConnectionInstanceDto> {
    if (!domain) {
      return null;
    }

    const dto: PlaceConnectionInstanceDto = {
      id: domain.id,
      placeConnectionId: domain.placeConnection?.id,
      playerId: domain.player?.id,
      content: domain.content
    };

    return dto;
  }

  async toDomain(dto: PlaceConnectionInstanceDto, domain?: Partial<PlaceConnectionInstance> | PlaceConnectionInstance): Promise<PlaceConnectionInstance> {
    if (!dto) {
      return domain as any as PlaceConnectionInstance;
    }

    if (!domain) {
      domain = {};
    }

    const placeConnectionId = dto.placeConnectionId ?? domain.placeConnection?.id;
    const playerId = dto.playerId ?? domain.player?.id;

    domain = {
      ...domain,
      placeConnection: await this.placeConnectionService.findOne(placeConnectionId),
      player: await this.playersService.findOne(playerId),
      content: dto.content
    };

    return domain as any as PlaceConnectionInstance;
  }
}

@Controller('place-connection-instances')
@UseFilters(AllExceptionsFilter)
export class PlaceConnectionInstanceController extends AbstractServiceController<PlaceConnectionInstance, PlaceConnectionInstanceDto> {
  constructor(service: PlaceConnectionInstanceService,
              mapper: PlaceConnectionInstanceMapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [PlaceConnectionsModule, PlayersModule, TypeOrmModule.forFeature([PlaceConnectionInstance])],
  controllers: [PlaceConnectionInstanceController],
  providers: [PlaceConnectionInstanceService, PlaceConnectionInstanceMapper, PlaceConnectionInstanceRepository],
  exports: [PlaceConnectionInstanceService, PlaceConnectionInstanceMapper]
})
export class PlaceConnectionInstancesModule {}