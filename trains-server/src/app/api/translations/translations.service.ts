import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

  async getOne(uuid: string) {
    const translation = this.repository.findOne(uuid);
    if (translation) {
      return translation;
    }

    throw new HttpException('Translation not found', HttpStatus.NOT_FOUND);
  }

  async create(translation: Translation) {
    const newTranslation = this.repository.create(translation);
    return await this.repository.save(newTranslation);
  }

  async update(uuid: string, translation: Translation) {
    const updateResponse: UpdateResult = await this.repository.update(
      uuid,
      translation,
    );
    if (!updateResponse || !updateResponse.affected) {
      throw new HttpException(
        'Translation not updated',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    return translation;
  }

  async delete(uuid: string): Promise<boolean> {
    const deleteResponse = await this.repository.delete(uuid);

    if (!deleteResponse || !deleteResponse.affected) {
      throw new HttpException('Translation not found', HttpStatus.NOT_FOUND);
    }

    return true;
  }
}
