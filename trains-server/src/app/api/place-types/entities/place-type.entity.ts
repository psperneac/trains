import { Column, Entity } from 'typeorm';
import { Expose } from 'class-transformer';
import { AbstractEntity } from '../../../../utils/abstract.entity';

@Entity({ name: 'PLACE_TYPES' })
export class PlaceType extends AbstractEntity {
  @Column('varchar', { length: 20 })
  @Expose()
  type: string;

  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;
}
