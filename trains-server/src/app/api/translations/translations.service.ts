import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TranslationDto } from "./dto/translation.dto";
import Translation from './entities/translation.entity';
import { AbstractService } from '../../../utils/abstract.service';
import { TranslationFeatureService } from "./translation-feature.service";

@Injectable()
export class TranslationsService extends AbstractService<Translation, TranslationDto> {
  constructor(
    private feature: TranslationFeatureService
  ) {
    super(feature);
  }

  getAllByLanguage(language: string): Promise<Translation[]> {
    return this.getRepository().createQueryBuilder('translation')
      .where('translation.language = :language', { language }).getMany();
  }
}
