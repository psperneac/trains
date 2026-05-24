import { Expose } from 'class-transformer';

export class Wallet {
  @Expose()
  gold = 0;

  @Expose()
  gems = 0;

  @Expose()
  parts = 0;

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
