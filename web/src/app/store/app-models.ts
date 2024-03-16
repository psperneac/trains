import { AbstractEntity } from '../helpers/abstract.entity';
import { PageDto } from '../models/page.model';
import { PageRequestDto } from '../models/pagination.model';

export interface ByMapRequestType {
  request: PageRequestDto;
  mapId: string;
}

export interface ByMapResponseType<T extends AbstractEntity> {
  result: PageDto<T>;
  mapId: string;
}

export interface ByPlayerAndMapRequestType {
  request: PageRequestDto;
  playerId: string;
  mapId: string;
}

export interface ByPlayerAndMapResponseType<T extends AbstractEntity> {
  result: PageDto<T>;
  playerId: string;
  mapId: string;
}

export interface ByVehicleRequestType {
  request: PageRequestDto;
  vehicleId: string;
}

export interface ByVehicleResponseType<T extends AbstractEntity> {
  result: PageDto<T>;
  vehicleId: string;
}

export interface ByPlaceRequestType {
  request: PageRequestDto;
  placeId: string;
}

export interface ByPlaceResponseType<T extends AbstractEntity> {
  result: PageDto<T>;
  placeId: string;
}

export interface ErrorType {
  error: any;
}
