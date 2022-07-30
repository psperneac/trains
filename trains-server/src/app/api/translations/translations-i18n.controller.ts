import { Controller, Get, Param, UseFilters } from '@nestjs/common';

import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { TranslationsService } from './translations.service';

@Controller('translations-i18n')
@UseFilters(AllExceptionsFilter)
export class TranslationsI18nController {
  constructor(private readonly service: TranslationsService) {
  }

  @Get(':language')
  getAll(@Param('language') language: string) {
    return this.service.getAllByLanguage(language).then((items) => {
      const ret = {};
      items
        .filter((item) => item.language === language)
        .forEach((item) => {
          ret[item.key] = item.content;
        });
      return ret;
    });
  }
}
