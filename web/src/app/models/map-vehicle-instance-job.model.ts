import { JobDto } from './job.model';

export interface MapVehicleInstanceJobDto extends JobDto {
  mapVehicleInstanceId: string;
  playerId: string;
  mapId: string;
  content: any;
}
