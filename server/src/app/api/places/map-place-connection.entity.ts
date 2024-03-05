import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { PlaceConnection } from './place-connection.entity';
import { MapTemplate } from '../maps/map-template.entity';

@Entity({ name: 'map_place_connections' })
export class MapPlaceConnection extends AbstractEntity {
  @OneToOne((_type) => PlaceConnection, { eager: true })
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
