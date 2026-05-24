import { Controller, Get, Injectable, Module, Param, UseFilters } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AbstractDto } from '../../../utils/abstract-dto';
import { AbstractMongoEntity } from '../../../utils/abstract-mongo.entity';
import { AbstractMongoService } from '../../../utils/abstract-mongo.service';
import { AbstractMongoServiceController } from '../../../utils/abstract-mongo-service.controller';
import { AbstractMongoDtoMapper } from '../../../utils/abstract-dto-mapper';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';

@Schema({ collection: 'translations' })
export class Translation extends AbstractMongoEntity {
  @Prop({ required: true, type: String, length: 10 })
  @Expose()
  language: string;

  @Prop({ required: true, type: String, length: 250 })
  @Expose()
  key: string;

  @Prop({ required: true, type: String, length: 1024 })
  @Expose()
  value: string;

  @Prop({ type: String, length: 2000 })
  @Expose()
  content: string;
}

export type TranslationDocument = import('mongoose').HydratedDocument<Translation>;
export const TranslationSchema = SchemaFactory.createForClass(Translation);

export interface TranslationDto extends AbstractDto {
  language: string;
  key: string;
  content: string;
  value: string;
}

@Injectable()
export class TranslationsService extends AbstractMongoService<Translation> {
  constructor(@InjectModel(Translation.name) private readonly translationModel: Model<TranslationDocument>) {
    super(translationModel);
  }

  getAllByLanguage(language: string): Promise<Translation[]> {
    return this.translationModel.find({ language }).exec();
  }
}

@Injectable()
export class TranslationMapper extends AbstractMongoDtoMapper<Translation, TranslationDto> {
  getMappedProperties() {
    return ['id', 'language', 'key', 'content', 'value'];
  }
}

@Controller('translations')
@UseFilters(AllExceptionsFilter)
export class TranslationsController extends AbstractMongoServiceController<Translation, TranslationDto> {
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
  imports: [
    MongooseModule.forFeature([{ name: Translation.name, schema: TranslationSchema }])
  ],
  controllers: [TranslationsController, TranslationsI18nController],
  providers: [TranslationsService, TranslationMapper],
  exports: [TranslationsService, TranslationMapper]
})
export class TranslationsModule {}
