import Translation from './entities/translation.entity';
import { TranslationDto } from './dto/translation.dto';
import { TranslationMapper } from './translation.mapper';
import { TranslationsService } from './translations.service';
import { TranslationsController } from './translations.controller';
import { TestConfig } from '../../../utils/test/test-config';

const createTranslation = (id: number): Translation => {
  return {
    id: 'ID' + id,
    version: 0,
    created: new Date(),
    updated: new Date(),
    deleted: null,
    language: id % 2 ? 'en-US' : 'en-GB',
    key: 'com.ikarsoft.string-' + id,
    content: 'This is string # ' + id,
  };
};

const createUpdateDto = (id: number): TranslationDto => {
  return {
    id: 'ID' + id,
    language: id % 2 ? 'en-US' : 'en-GB',
    key: 'com.ikarsoft.string-' + id,
    content: 'This is updated string # ' + id,
  };
};

const createPatchDto = (id: number): Partial<TranslationDto> => {
  return {
    language: id % 2 ? 'en-US' : 'en-GB',
    key: 'com.ikarsoft.string-' + id,
    content: 'This is patched string # ' + id,
  };
};

export const TranslationTestConfig: TestConfig<Translation, TranslationDto> = {
  name: 'Translations',
  url: '/translations',

  createEntity: createTranslation,
  createUpdateDto,
  createPatchDto,

  data: [
    createTranslation(1),
    createTranslation(2),
    createTranslation(3),
    createTranslation(4),
    createTranslation(5),
    createTranslation(6),
    createTranslation(7),
    createTranslation(8),
    createTranslation(9),
  ],

  newEntityId: 10,
  existingEntityId: 4,

  entityClass: Translation,
  mapperClass: TranslationMapper,
  serviceClass: TranslationsService,
  controllerClass: TranslationsController,
};
