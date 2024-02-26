import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { MapPlaceConnection } from '../maps/map-place-connection.entity';
import { MapTemplate } from '../maps/map-template.entity';
import { Player } from '../players/player.entity';

@Entity({ name: 'map_place_connection_instances' })
export class MapPlaceConnectionInstance extends AbstractEntity {
  @ManyToOne(type => MapPlaceConnection, { eager: true })
  @JoinColumn({ name: 'map_place_connection_id' })
  @Expose()
  mapPlaceConnection: MapPlaceConnection;

  @ManyToOne(type => Player, { eager: true })
  @JoinColumn({ name: 'player_id' })
  @Expose()
  player: Player;

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
