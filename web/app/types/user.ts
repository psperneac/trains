import type { WalletDto } from './player';

export interface AdminUserDto {
  id: string;
  username: string;
  email: string;
  scope: string;
  preferences: any;
  wallet?: WalletDto;
  created: string;
  updated: string;
  players?: any[];
}

export interface SendGoldAndGemsToUserDto {
  userId: string;
  gold: number;
  gems: number;
  parts: number;
}

export interface PageDto<T> {
  data: T[];
  page: number;
  limit: number;
  totalCount: number;
}
