import { Injectable } from "@angular/core";
import { VehicleTypeDto } from "../../../models/vehicle-type.model";
import { AbstractService } from "../../../helpers/abstract.service";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class VehicleTypeService extends AbstractService<VehicleTypeDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, 'api/vehicle-types');
  }
}
