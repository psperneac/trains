import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { Player } from '../players/player.entity';
import { PlaceConnection } from './place-connection.entity';

@Entity({ name: 'place_connection_instances' })
export class PlaceConnectionInstance extends AbstractEntity {
  @ManyToOne(type => PlaceConnection, { eager: true })
  @JoinColumn({ name: 'place_connection_id' })
  @Expose()
  placeConnection: PlaceConnection;

  @ManyToOne(type => Player, { eager: true })
  @JoinColumn({ name: 'player_id' })
  @Expose()
  player: Player;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface PlaceConnectionInstanceDto {
  id: string;
  placeConnectionId: string;
  playerId: string;
  content: any;
}
