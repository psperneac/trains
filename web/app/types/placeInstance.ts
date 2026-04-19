export interface PlaceDto {
  id: string;
  name: string;
  description: string;
  type: string;
  lat: number;
  lng: number;
  gameId: string;
}

export interface PlaceInstanceDto {
  id: string;
  placeId: string;
  gameId: string;
  playerId: string;
  place?: PlaceDto;
  jobOffers: any[];
  content: any;
}