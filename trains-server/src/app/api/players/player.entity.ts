import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { MapTemplate } from '../maps/map-template.entity';
import { PlaceInstance } from '../places/place-instance.entity';
import { User } from '../users/users.entity';
import { VehicleInstance } from '../vehicles/vehicle-instance.entity';

@Entity({ name: 'players' })
export class Player extends AbstractEntity {
  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;

  @OneToOne(_type => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(_type => MapTemplate, { eager: true })
  @JoinColumn({ name: 'map_id' })
  @Expose()
  map: MapTemplate;

  @OneToMany(_type => VehicleInstance, vehicleInstance => vehicleInstance.player)
  @Expose()
  vehicles: VehicleInstance[];

  @OneToMany(_type => PlaceInstance, placeInstance => placeInstance.player)
  @Expose()
  places: PlaceInstance[];

  @OneToMany(_type => PlaceInstance, placeConnectionInstance => placeConnectionInstance.player)
  @Expose()
  placeConnections: PlaceInstance[];

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface PlayerDto {
  id: string;
  name: string;
  description: string;
  userId: string;
  mapId: string;
  vehicles: string[];
  places: string[];
  placeConnections: string[];
  content: any;
}
