export interface PlayerDto {
  id?: string;
  name: string;
  description: string;
  content: any;
  userId?: string;
  mapId?: string;
  vehicles?: string[];
  places?: string[];
  placeConnections?: string[];
}
