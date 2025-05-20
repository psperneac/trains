import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '../../../utils/abstract.entity';

@Entity({ name: 'places' })
export class Place2 extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  type: string;

  @Column()
  lat: number;

  @Column()
  lng: number;
}
