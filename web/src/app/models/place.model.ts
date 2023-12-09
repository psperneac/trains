import { AbstractEntity } from '../helpers/abstract.entity';

export interface PlaceDto extends AbstractEntity {
  name: string;
  description: string;
  type: string;
  lat: number;
  lng: number;
}

export type PlaceDtoMap = { [id: string]: PlaceDto };
