import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Translation from './entities/translation.entity';
import { TranslationMapper } from './translation.mapper';
import { TranslationsI18nController } from './translations-i18n.controller';
import { TranslationsController } from './translations.controller';
import { TranslationsService } from './translations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Translation])],
  controllers: [TranslationsController, TranslationsI18nController],
  providers: [TranslationsService, TranslationMapper],
  exports: [TranslationsService, TranslationMapper],
})
export class TranslationsModule {}
