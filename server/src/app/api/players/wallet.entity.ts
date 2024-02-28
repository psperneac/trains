import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { Player } from './player.entity';

@Entity({ name: 'wallets' })
export class Wallet extends AbstractEntity {
  @OneToOne(_type => Player, (player) => player.wallet)
  @JoinColumn({ name: 'player_id' })
  @Expose()
  player: Player;

  @Column('integer')
  @Expose()
  gold = 0;

  @Column('integer')
  @Expose()
  gems = 0;

  @Column('integer')
  @Expose()
  parts = 0;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface WalletDto {
  id: string;
  playerId: string;
  gold: number;
  gems: number;
  parts: number;
  content: any;
}
