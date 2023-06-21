import { Expose } from 'class-transformer';
import { Column } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';

export class Player extends AbstractEntity {
  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;
}
