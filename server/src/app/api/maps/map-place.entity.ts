import { Expose } from 'class-transformer';
import { Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { Place } from '../places/place.entity';
import { MapTemplate } from './map-template.entity';

@Entity({ name: 'map_places' })
export class MapPlace extends AbstractEntity {
  @OneToOne((_type) => Place, { eager: true })
  @JoinColumn({ name: 'place_id' })
  @Expose()
  place: Place;

  @ManyToOne(type => MapTemplate, { eager: true })
  @JoinColumn({ name: 'map_id' })
  @Expose()
  map: MapTemplate;
}

export interface MapPlaceDto {
  id: string;
  placeId: string;
  mapId: string;
}
