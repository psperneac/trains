export interface WalletDto {
  id: string;
  gold: number;
  gems: number;
  parts: number;
  content: any;
}

export interface PlayerDto {
  id: string;
  name: string;
  description: string;
  userId: string;
  gameId: string;
  wallet?: WalletDto;
  content: any;
}

export interface SendGoldAndGemsDto {
  playerId: string;
  gold: number;
  gems: number;
  parts: number;
}

export enum TransactionType {
  GOLD_GEMS_TRANSFER = 'GOLD_GEMS_TRANSFER',
  ITEM_TRANSFER = 'ITEM_TRANSFER',
  GAME_ACTION = 'GAME_ACTION',
}

export enum EntityType {
  USER = 'USER',
  PLAYER = 'PLAYER',
  GAME = 'GAME',
  PLACE = 'PLACE',
}

export interface TransactionDto {
  id: string;
  type: TransactionType;
  sourceId: string;
  sourceType: EntityType;
  targetId: string;
  targetType: EntityType;
  payload: any;
  description: string;
  created: string;
  updated: string;
}

