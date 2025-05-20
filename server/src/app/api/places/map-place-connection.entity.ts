import { Expose } from 'class-transformer';
import { Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { AbstractEntity } from '../../../utils/abstract.entity';
import { MapTemplate } from '../maps/map-template.entity';

import { PlaceConnection } from './place-connection.module';

@Entity({ name: 'map_place_connections' })
export class MapPlaceConnection extends AbstractEntity {
  @OneToOne(_type => PlaceConnection, { eager: true })
  @JoinColumn({ name: 'place_connection_id' })
  @Expose()
  placeConnection: PlaceConnection;

  @ManyToOne(type => MapTemplate, { eager: true })
  @JoinColumn({ name: 'map_id' })
  @Expose()
  map: MapTemplate;
}

export interface MapPlaceConnectionDto {
  id: string;
  placeConnectionId: string;
  mapId: string;
}
