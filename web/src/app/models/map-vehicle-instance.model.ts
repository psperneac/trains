export interface MapVehicleInstanceDto {
  id?: string;
  mapVehicleId: string;
  startId: string;
  endId: string;
  startTime: string;
  endTime: string;
  playerId: string;
  mapId: string;
  jobs: string[];
  content: any;
}
