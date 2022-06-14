import { Injectable } from '@nestjs/common';
import { assign } from 'lodash';

import { TranslationDto } from './dto/translation.dto';
import Translation from './entities/translation.entity';

@Injectable()
export class TranslationMapper {
  toDto(translation: Translation): TranslationDto {
    return {
      id: translation.id,
      language: translation.language,
      key: translation.key,
      content: translation.content,
    };
  }

  toDomain(dto: TranslationDto, translations?: Translation): Translation {
    const ret = {
      ...translations,
    };

    assign(ret, dto);

    return ret;
  }
}
