import { AbstractEntity } from '../helpers/abstract.entity';

export interface PlaceDto extends AbstractEntity {
  name: string;
  description: string;
  type: string;
  lat: number;
  lng: number;
}

export type PlaceDtoMap = { [id: string]: PlaceDto };

export interface MapPlaceInstanceDto extends AbstractEntity {
  mapPlaceId: string;
  playerId: string;
  mapId: string;
  jobs: string[];
  jobOffers: string[];
  content: any;
}

export type MapPlaceInstanceDtoMap = { [id: string]: MapPlaceInstanceDto };
