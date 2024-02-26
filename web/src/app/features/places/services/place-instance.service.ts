import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractService } from '../../../helpers/abstract.service';
import { PlaceInstanceDto } from '../../../models/place.model';

@Injectable()
export class PlaceInstanceService extends AbstractService<PlaceInstanceDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, 'api/place-instances');
  }
}
