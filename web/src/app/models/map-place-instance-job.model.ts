import { JobDto } from './job.model';

export interface MapPlaceInstanceJobDto extends JobDto {
  mapPlaceInstanceId: string;
  playerId: string;
  mapId: string;
  content: any;
}
