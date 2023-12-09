import { HttpClient } from '@angular/common/http';
import { AbstractService } from '../../../helpers/abstract.service';
import { MapTemplateDto } from '../../../models/map-template.model';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root'})
export class MapTemplateService extends AbstractService<MapTemplateDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, '/api/maps');
  }
}
