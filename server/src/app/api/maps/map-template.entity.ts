import { Expose } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../utils/abstract.entity';
import { MapPlaceConnection } from '../places/map-place-connection.entity';
import { MapPlace } from '../places/map-place.entity';

@Entity({ name: 'maps' })
export class MapTemplate extends AbstractEntity {
  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;

  @OneToMany(_type => MapPlace, mapPlace => mapPlace.map)
  places: MapPlace[];

  @OneToMany(_type => MapPlaceConnection, mapPlaceConnection => mapPlaceConnection.map)
  placeConnections: MapPlaceConnection[];

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface MapTemplateDto {
  id: string;
  name: string;
  description: string;
  places?: string[];
  placeConnections?: string[];
  content: any;
}
