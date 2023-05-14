import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractService } from '../../../helpers/abstract.service';
import { VehicleDto } from '../../../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService extends AbstractService<VehicleDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, '/api/vehicles');
  }
}
