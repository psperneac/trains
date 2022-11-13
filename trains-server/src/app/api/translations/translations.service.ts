import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateResult } from 'typeorm';
import { PageDto } from '../../../models/page.model';
import { PageRequestDto } from '../../../models/pagination.model';
import { Repository } from 'typeorm';
import Translation from './entities/translation.entity';
import { AbstractService } from '../../../utils/abstract.service';

@Injectable()
export class TranslationsService extends AbstractService<Translation> {
  constructor(
    @InjectRepository(Translation)
    private readonly repository: Repository<Translation>,
  ) {
    super();
  }

  getAllByLanguage(language: string): Promise<Translation[]> {
    return this.repository
      .createQueryBuilder('translation')
      .where('translation.language = :language', { language })
      .getMany();
  }

  public getRepository(): Repository<Translation> {
    return this.repository;
  }
}
