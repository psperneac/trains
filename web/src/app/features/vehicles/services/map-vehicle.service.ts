import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import urljoin from 'url-join';
import { environment } from '../../../../environments/environment';
import { AbstractService } from '../../../helpers/abstract.service';
import { toParams } from '../../../helpers/http.helpers';
import { MapVehicleDto } from '../../../models/map-vehicle.model';
import { PageDto } from '../../../models/page.model';
import { PageRequestDto } from '../../../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class MapVehicleService extends AbstractService<MapVehicleDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, '/api/map-vehicles');
  }

  getAllByMap(pagination: PageRequestDto, mapId: string) {
    return this.httpClient.get<PageDto<MapVehicleDto>>(urljoin(environment.api, this.path, 'by-map', mapId), {
      params: toParams(pagination)
    });
  }
}
