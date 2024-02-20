import { AbstractEntity } from '../helpers/abstract.entity';

export interface PlaceDto extends AbstractEntity {
  name: string;
  description: string;
  type: string;
  lat: number;
  lng: number;
}

export type PlaceDtoMap = { [id: string]: PlaceDto };

export interface PlaceInstanceDto extends AbstractEntity {
  placeId: string;
  playerId: string;
  jobs: string[];
  jobOffers: string[];
  content: any;
}

export type PlaceInstanceDtoMap = { [id: string]: PlaceInstanceDto };
