import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { MapTemplate } from '../maps/map-template.entity';
import { MapPlaceInstance } from '../places/map-place-instance.entity';
import { User } from '../users/users.entity';
import { MapVehicleInstance } from '../vehicles/map-vehicle-instance.entity';
import { Wallet } from './wallet.entity';

@Entity({ name: 'players' })
export class Player2 extends AbstractEntity {
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

  @OneToMany(_type => MapVehicleInstance, vehicleInstance => vehicleInstance.playerId)
  @Expose()
  vehicles: MapVehicleInstance[];

  @OneToMany(_type => MapPlaceInstance, placeInstance => placeInstance.playerId)
  @Expose()
  places: MapPlaceInstance[];

  @OneToMany(_type => MapPlaceInstance, placeConnectionInstance => placeConnectionInstance.playerId)
  @Expose()
  placeConnections: MapPlaceInstance[];

  @OneToOne(() => Wallet, wallet => wallet.player, { eager: true }) // specify inverse side as a second parameter
  @Expose()
  wallet: Wallet;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface Player2Dto {
  id: string;
  name: string;
  description: string;
  walletId: string;
  userId: string;
  mapId: string;
  vehicles: string[];
  places: string[];
  placeConnections: string[];
  content: any;
}
