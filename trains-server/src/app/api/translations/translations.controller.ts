import {
  Controller,
  UseFilters,
} from '@nestjs/common';

import { TranslationDto } from './dto/translation.dto';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { TranslationMapper } from './translation.mapper';
import { TranslationsService } from './translations.service';
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import Translation from './entities/translation.entity';
import { AbstractService } from '../../../utils/abstract.service';
import { Mapper } from '../../../utils/mapper';

@Controller('translations')
@UseFilters(AllExceptionsFilter)
export class TranslationsController extends AbstractServiceController<Translation, TranslationDto> {
  constructor(
    private readonly service: TranslationsService,
    private readonly mapper: TranslationMapper,
  ) {
    super();
  }

  public getService(): AbstractService<Translation> {
    return this.service;
  }
  public getMapper(): Mapper<Translation, TranslationDto> {
    throw this.mapper;
  }
}
