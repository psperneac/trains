import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { PlacesModule, PlacesService } from '../places/places.module';
import { PlaceConnection, PlaceConnectionDto } from './place-connection.entity';
import { omit } from 'lodash';

@Injectable()
export class PlaceConnectionRepository extends RepositoryAccessor<PlaceConnection> {
  constructor(@InjectRepository(PlaceConnection) injectedRepo) {
    super(injectedRepo, ['start', 'end']);
  }
}

@Injectable()
export class PlaceConnectionService extends AbstractService<PlaceConnection> {
  constructor(repo: PlaceConnectionRepository) {
    super(repo);
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
      id: domain.id,
      type: domain.type,
      name: domain.name,
      description: domain.description,
      content: domain.content,
      startId: domain.start?.id,
      endId: domain.end?.id
    };

    return dto;
  }

  async toDomain(dto: PlaceConnectionDto, domain?: Partial<PlaceConnection> | PlaceConnection): Promise<PlaceConnection> {
    if (!dto) {
      return domain as any as PlaceConnection;
    }

    if (!domain) {
      domain = {};
    }

    const startId = dto.startId ?? domain.start?.id;
    const endId = dto.endId ?? domain.end?.id;

    const fixedDto = omit(
      {
        ...dto
      },
      ['startId', 'endId']
    );

    return Promise.all([this.getPlace(startId), this.getPlace(endId)]).then(([start, end]) => {
      return {
        ...domain,
        ...fixedDto,
        start,
        end
      } as any as PlaceConnection;
    });
  }

  getPlace(id: string) {
    return id ? this.service.findOne(id) : null;
  }
}

@Controller('place-connections')
@UseFilters(AllExceptionsFilter)
export class PlaceConnectionController extends AbstractServiceController<PlaceConnection, PlaceConnectionDto> {
  constructor(service: PlaceConnectionService, mapper: PlaceConnectionMapper) {
    super(service, mapper);
  }
}

@Module({
  imports: [PlacesModule, TypeOrmModule.forFeature([PlaceConnection])],
  controllers: [PlaceConnectionController],
  providers: [PlaceConnectionService, PlaceConnectionMapper, PlaceConnectionRepository],
  exports: [PlaceConnectionService, PlaceConnectionMapper]
})
export class PlaceConnectionsModule {}
