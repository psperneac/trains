import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {PlaceDto} from "../../../models/place.model";
import {AbstractService} from "../../../helpers/abstract.service";

@Injectable()
export class PlaceService extends AbstractService<PlaceDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, 'api/places');
  }
}
