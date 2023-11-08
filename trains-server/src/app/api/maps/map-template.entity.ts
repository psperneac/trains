import { Expose } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { MapPlaceConnection } from './map-place-connection.entity';
import { MapPlace } from './map-place.entity';

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
  placeConnections: MapPlace[];
}

export interface MapTemplateDto {
  id: string;
  name: string;
  description: string;
  places?: string[];
  placeConnections?: string[];
}
