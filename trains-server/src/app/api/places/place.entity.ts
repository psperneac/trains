import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';

@Entity({ name: 'PLACES' })
class Place extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  type: string;

  @Column()
  lat: number;

  @Column()
  long: number;
}

export default Place;
