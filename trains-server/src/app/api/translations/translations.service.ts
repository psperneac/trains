import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateResult } from 'typeorm';
import { PageDto } from '../../../models/page.model';
import { PageRequestDto } from '../../../models/pagination.model';
import { Repository } from 'typeorm';
import Translation from './translation.entity';

@Injectable()
export class TranslationsService {
  constructor(
    @InjectRepository(Translation)
    private readonly repository: Repository<Translation>,
  ) {}

  getAll(pagination: PageRequestDto): Promise<PageDto<Translation>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skippedItems = (page - 1) * limit;

    return Promise.all([
      this.repository
        .createQueryBuilder()
        .offset(skippedItems)
        .limit(limit)
        .getMany(),
      this.repository.count(),
    ]).then(([translations, count]) => ({
      data: translations,
      page,
      limit,
      totalCount: count,
    }));
  }

  getAllByLanguage(language: string): Promise<Translation[]> {
    return this.repository
      .createQueryBuilder('translation')
      .where('translation.language = :language', { language })
      .getMany();
  }

  getOne(uuid: string): Promise<Translation> {
    return this.repository.findOne(uuid);
  }

  create(translation: Translation): Promise<Translation> {
    const newTranslation = this.repository.create(translation);
    return this.repository.save(newTranslation);
  }

  update(uuid: string, translation: Translation): Promise<UpdateResult> {
    return this.repository.update(uuid, translation);
  }

  delete(uuid: string): Promise<boolean> {
    return this.repository.delete(uuid).then((deleteResponse) => {
      if (!deleteResponse || !deleteResponse.affected) {
        return false;
      }

      return true;
    });
  }
}
