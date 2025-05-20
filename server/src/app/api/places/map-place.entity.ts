import { AbstractEntity } from 'src/utils/abstract.entity';
import { MapTemplate } from '../maps/map-template.entity';
import { Place } from '../places/place.module';
import { Entity, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Expose } from 'class-transformer';

@Entity({ name: 'map_places' })
export class MapPlace extends AbstractEntity {
  @OneToOne(_type => Place, { eager: true })
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
