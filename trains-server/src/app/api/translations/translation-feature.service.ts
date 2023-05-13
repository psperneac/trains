import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Mapper } from "../../../utils/abstract-dto-mapper";
import { AbstractService } from "../../../utils/abstract.service";
import { FeatureService } from "../../../utils/feature.service";
import { TranslationDto } from "./dto/translation.dto";
import Translation from "./entities/translation.entity";
import { TranslationMapper } from "./translation.mapper";
import { TranslationsService } from "./translations.service";

@Injectable()
export class TranslationFeatureService implements FeatureService<Translation, TranslationDto> {
  constructor(
    @InjectRepository(Translation) private readonly repository: Repository<Translation>,
    private readonly service: TranslationsService,
    private readonly mapper: TranslationMapper
  ) {
  }

  getMappedProperties(): string[] {
    return [];
  }

  getMapper(): Mapper<Translation, TranslationDto> {
    return this.mapper;
  }

  getRepository(): Repository<Translation> {
    return this.repository;
  }

  getService(): AbstractService<Translation, TranslationDto> {
    return this.service;
  }

}