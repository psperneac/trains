import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { Place } from '../places/place.entity';
import { MapTemplate } from './map-template.entity';

@Entity({ name: 'map_places' })
export class MapPlace extends AbstractEntity {
  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;

  @OneToOne((_type) => Place, { eager: true })
  @JoinColumn({ name: 'PLACE_ID' })
  place: Place;

  @ManyToOne(type => Map, { eager: true })
  @JoinColumn({ name: 'MAP_ID' })
  map: MapTemplate;
}
