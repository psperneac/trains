export interface PlayerDto {
  id: string;
  name: string;
  description: string;
  userId: string;
  mapId: string;
  vehicles: string[];
  places: string[];
  placeConnections: string[];
  content: any;
}
