import type { PlaceDto } from './place';
import type { PlaceInstanceDto } from './placeInstance';
import type { VehicleDto } from './vehicle';

export type VehicleInstanceStatus = 'AT_PLACE' | 'IN_TRANSIT';

export interface VehicleInstanceDto {
  id: string;
  vehicleId: string;
  vehicle?: VehicleDto;
  currentPlaceInstanceId: string;
  destinationPlaceInstanceId: string;
  currentPlaceInstance?: PlaceInstanceDto;
  destinationPlaceInstance?: PlaceInstanceDto;
  route: string[];
  status: VehicleInstanceStatus;
  gameId: string;
  playerId: string;
  content: any;
}