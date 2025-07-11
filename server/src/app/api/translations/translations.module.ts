import { Controller, Get, Injectable, Module, Param, UseFilters } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';

import { AbstractDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import { AbstractService } from '../../../utils/abstract.service';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { RepositoryAccessor } from '../../../utils/repository-accessor';

import { Translation, TranslationDto } from './translation.entity';

@Injectable()
export class TranslationRepository extends RepositoryAccessor<Translation> {
  constructor(@InjectRepository(Translation) private readonly injectedRepository) {
    super(injectedRepository);
  }
}

@Injectable()
export class TranslationsService extends AbstractService<Translation> {
  constructor(private readonly repo: TranslationRepository) {
    super(repo);
  }

  getAllByLanguage(language: string): Promise<Translation[]> {
    return this.repository
      .createQueryBuilder('translation')
      .where('translation.language = :language', { language })
      .getMany();
  }
}

@Injectable()
export class TranslationMapper extends AbstractDtoMapper<Translation, TranslationDto> {
  getMappedProperties() {
    return ['id', 'language', 'key', 'content'];
  }
}

@Controller('translations')
@UseFilters(AllExceptionsFilter)
export class TranslationsController extends AbstractServiceController<Translation, TranslationDto> {
  constructor(service: TranslationsService, mapper: TranslationMapper) {
    super(service, mapper);
  }
}

@Controller('translations-i18n')
@UseFilters(AllExceptionsFilter)
export class TranslationsI18nController {
  constructor(private readonly service: TranslationsService) {}

  @Get(':language')
  getAll(@Param('language') language: string) {
    return this.service.getAllByLanguage(language).then(items => {
      const ret = {};
      items
        .filter(item => item.language === language)
        .forEach(item => {
          ret[item.key] = item.content;
        });
      return ret;
    });
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Translation])],
  controllers: [TranslationsController, TranslationsI18nController],
  providers: [TranslationsService, TranslationMapper, TranslationRepository],
  exports: [TranslationsService, TranslationMapper, TranslationRepository]
})
export class TranslationsModule {}
