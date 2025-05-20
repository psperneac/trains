import { Controller, Injectable, Module, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';

import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';

import { MapTemplate, MapTemplateDto } from './map-template.entity';

@Injectable()
export class MapTemplateRepository extends RepositoryAccessor<MapTemplate> {
  constructor(@InjectRepository(MapTemplate) injectedRepo) {
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
      id: domain._id.toString(),
      name: domain.name,
      description: domain.description,
      places: domain.places?.map(p => p._id.toString()),
      placeConnections: domain.placeConnections?.map(p => p._id.toString()),
      content: domain.content
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
      ...dto
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

@Module({
  imports: [TypeOrmModule.forFeature([MapTemplate])],
  controllers: [MapTemplateController],
  providers: [MapTemplateService, MapTemplateMapper, MapTemplateRepository],
  exports: [MapTemplateService, MapTemplateMapper]
})
export class MapTemplateModule {}
