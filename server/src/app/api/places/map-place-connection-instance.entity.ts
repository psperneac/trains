import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../utils/abstract.entity';
import { MapTemplate } from '../maps/map-template.entity';

import { MapPlaceConnection } from './map-place-connection.entity';

@Entity({ name: 'map_place_connection_instances' })
export class MapPlaceConnectionInstance extends AbstractEntity {
  @ManyToOne(type => MapPlaceConnection, { eager: true })
  @JoinColumn({ name: 'map_place_connection_id' })
  @Expose()
  mapPlaceConnection: MapPlaceConnection;

  @Column({ name: 'player_id' })
  @Expose()
  playerId: string;

  @ManyToOne(type => MapTemplate, { eager: true })
  @JoinColumn({ name: 'map_id' })
  @Expose()
  map: MapTemplate;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface MapPlaceConnectionInstanceDto {
  id: string;
  mapPlaceConnectionId: string;
  playerId: string;
  mapId: string;
  content: any;
}
