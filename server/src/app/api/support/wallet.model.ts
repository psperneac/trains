import { Expose } from 'class-transformer';
import { Column } from 'typeorm';

export class Wallet {
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
  gold: number;
  gems: number;
  parts: number;
  content: any;
}

export class SendGoldAndGemsDto {
  playerId: string;
  gold: number;
  gems: number;
  parts: number;
}
