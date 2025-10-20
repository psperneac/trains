export enum GameType {
  TEMPLATE = 'TEMPLATE',
  GAME = 'GAME'
}

export interface GameDto {
  id: string;
  name: string;
  description: string;
  type: GameType;
  places?: string[];
  placeConnections?: string[];
  content: any;
}
