import { Column, Entity } from 'typeorm';
import { Expose } from 'class-transformer';
import { AbstractEntity } from '../../../utils/abstract.entity';

@Entity({ name: 'TRANSLATIONS' })
class Translation extends AbstractEntity {
  @Column()
  @Expose()
  public language: string;

  @Column()
  @Expose()
  public key: string;

  @Column()
  @Expose()
  public content: string;
}

export default Translation;
