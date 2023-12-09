import { Expose } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { AbstractDto } from '../../../utils/abstract-dto';
import { AbstractEntity } from '../../../utils/abstract.entity';

@Entity({ name: 'translations' })
export class Translation extends AbstractEntity {
  @Column('varchar', { length: 10 })
  @Expose()
  public language: string;

  @Column('varchar', { length: 250 })
  @Expose()
  public key: string;

  @Column('varchar', { length: 2000 })
  @Expose()
  public content: string;
}

export interface TranslationDto extends AbstractDto {
  language: string;
  key: string;
  content: string;
}
