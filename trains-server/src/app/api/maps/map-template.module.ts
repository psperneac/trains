import { Injectable, UseFilters } from '@nestjs/common';
import { RepositoryAccessor } from '../../../utils/repository-accessor';
import { MapTemplate, MapTemplateDto } from './map-template.entity';
import { AbstractService } from '../../../utils/abstract.service';
import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';

@Injectable()
export class MapTemplateRepository extends RepositoryAccessor<MapTemplate> {
  constructor(injectedRepo) {
    super(injectedRepo, ['places', 'placeConnections']);
  }
}

@Injectable()
export class MapTemplateService extends AbstractService<MapTemplate> {
  constructor(repo: MapTemplateRepository) {
    super(repo);
  }
}

@Injectable()
export class MapTemplateMapper extends AbstractDtoMapper<MapTemplate, MapTemplateDto> {
  constructor() {
    super();
  }

  async toDto(domain: MapTemplate): Promise<MapTemplateDto> {
    if (!domain) {
      return null;
    }

    const dto: MapTemplateDto = {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      places: domain.places?.map(p => p.id),
      placeConnections: domain.placeConnections?.map(p => p.id)
    };

    return dto;
  }

  async toDomain(dto: MapTemplateDto, domain?: Partial<MapTemplate> | MapTemplate): Promise<MapTemplate> {
    if (!dto) {
      return domain as any as MapTemplate;
    }

    if (!domain) {
      domain = {};
    }

    return {
      ...domain,
      name: dto.name,
      description: dto.description
    } as MapTemplate;
  }
}

@Controller('maps')
@UseFilters(AllExceptionsFilter)
export class MapTemplateController extends AbstractServiceController<MapTemplate, MapTemplateDto> {
  constructor(service: MapTemplateService, mapper: MapTemplateMapper) {
    super(service, mapper);
  }
}
