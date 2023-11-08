import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractDto } from '../../../utils/abstract-dto';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { Place } from './place.entity';

@Entity({ name: 'place_connections'})
export class PlaceConnection extends AbstractEntity {
  @Column('varchar', { length: 20 })
  @Expose()
  type: string;

  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;

  @Column({ type: 'json' })
  @Expose()
  content: any;

  @ManyToOne(type => Place, { eager: true })
  @JoinColumn({ name: 'start' })
  @Expose()
  start: Place;

  @ManyToOne(type => Place, { eager: true })
  @JoinColumn({ name: 'end' })
  @Expose()
  end: Place;
}

export class PlaceConnectionDto implements AbstractDto {
  id: string;
  type: string;
  name: string;
  description: string;
  content: any;

  startId: string;
  endId: string;
}