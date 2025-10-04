export enum MapType {
  TEMPLATE = 'TEMPLATE',
  GAME = 'GAME'
}

export interface MapDto {
  id: string;
  name: string;
  description: string;
  type: MapType;
  places?: string[];
  placeConnections?: string[];
  content: any;
} 