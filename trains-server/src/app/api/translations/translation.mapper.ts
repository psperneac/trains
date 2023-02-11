import { Injectable } from '@nestjs/common';
import { assign } from 'lodash';

import { TranslationDto } from './dto/translation.dto';
import Translation from './entities/translation.entity';
import { AbstractMapper } from '../../../utils/abstract.mapper';

@Injectable()
export class TranslationMapper implements AbstractMapper<Translation, TranslationDto> {
  toDto(translation: Translation): TranslationDto {
    if (!translation) {
      return null;
    }

    return {
      id: translation.id,
      language: translation.language,
      key: translation.key,
      content: translation.content,
    };
  }

  toDomain(dto: TranslationDto, translation?: Translation): Translation {
    return assign({}, translation ?? {}, dto ?? {});
  }
}
