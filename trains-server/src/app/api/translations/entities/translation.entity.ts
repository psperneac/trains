import { Column, Entity } from 'typeorm';
import { Expose } from 'class-transformer';
import { AbstractEntity } from '../../../../utils/abstract.entity';

@Entity({ name: 'TRANSLATIONS' })
class Translation extends AbstractEntity {
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

export default Translation;
