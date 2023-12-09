import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractService } from '../../../helpers/abstract.service';
import { PlaceConnectionDto } from '../../../models/place-connection.model';

@Injectable({ providedIn: 'root'})
export class PlaceConnectionService extends AbstractService<PlaceConnectionDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, '/api/place-connections');
  }
}
