import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { PlaceConnection } from '../place-connections/place-connection.entity';
import { MapTemplate } from './map-template.entity';

@Entity({ name: 'map_place_connections' })
export class MapPlaceConnection extends AbstractEntity {
  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;

  @OneToOne((_type) => PlaceConnection, { eager: true })
  @JoinColumn({ name: 'PLACE_CONNECTION_ID' })
  place: PlaceConnection;

  @ManyToOne(type => Map, { eager: true })
  @JoinColumn({ name: 'MAP_ID' })
  map: MapTemplate;
}
