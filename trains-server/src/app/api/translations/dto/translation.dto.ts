import { AbstractDto } from '../../../../utils/abstract-dto';

export interface TranslationDto extends AbstractDto {
  language: string;
  key: string;
  content: string;
}
