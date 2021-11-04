export interface PlaceDto {
  id: string;
  name: string;
  description: string;
  type: string;
  lat: number;
  long: number;
}

export interface CreatePlaceDto {
  name: string;
  description: string;
  type: string;
  lat: number;
  long: number;
}

export interface UpdatePlaceDto {
  id: string;
  name: string;
  description: string;
  type: string;
  lat: number;
  long: number;
}
