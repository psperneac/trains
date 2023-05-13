import { Controller, UseFilters } from '@nestjs/common';

import { TranslationDto } from './dto/translation.dto';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { TranslationFeatureService } from "./translation-feature.service";
import { AbstractServiceController } from '../../../utils/abstract-service.controller';
import Translation from './entities/translation.entity';

@Controller('translations')
@UseFilters(AllExceptionsFilter)
export class TranslationsController extends AbstractServiceController<Translation, TranslationDto> {
  constructor(private feature: TranslationFeatureService) {
    super(feature);
  }
}
