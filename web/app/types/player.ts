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
  wallet: WalletDto;
  content: any;
}
