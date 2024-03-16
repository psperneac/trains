import { JobDto } from './job.model';

export interface MapPlaceInstanceJobOfferDto extends JobDto {
  mapPlaceInstanceId: string;
  playerId: string;
  mapId: string;
  jobOfferExpiry: string;
  content: any;
}
