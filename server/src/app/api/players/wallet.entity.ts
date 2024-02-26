import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { Player } from './player.entity';

@Entity({ name: 'wallets' })
export class Wallet extends AbstractEntity {
  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;

  @OneToOne(_type => Player, { eager: true })
  @JoinColumn({ name: 'player_id' })
  @Expose()
  player: Player;

  @Column()
  @Expose()
  gold = 0;

  @Column()
  @Expose()
  gems = 0;

  @Column()
  @Expose()
  parts = 0;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface WalletDto {
  id: string;
  name: string;
  description: string;
  playerId: string;
  gold: number;
  gems: number;
  parts: number;
  content: any;
}
