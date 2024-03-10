import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import urljoin from 'url-join';
import { environment } from '../../../../environments/environment';
import { AbstractService } from '../../../helpers/abstract.service';
import { toParams } from '../../../helpers/http.helpers';
import { MapVehicleInstanceDto } from '../../../models/map-vehicle-instance.model';
import { PageDto } from '../../../models/page.model';

@Injectable({ providedIn: 'root' })
export class MapVehicleInstanceService extends AbstractService<MapVehicleInstanceDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, '/api/map-vehicle-instances');
  }

  getAllByPlayerAndMap(pagination: any, playerId: string, mapId: string) {
    return this.httpClient.get<PageDto<MapVehicleInstanceDto>>(urljoin(environment.api, this.path, 'by-player-and-map', playerId, mapId), {
      params: toParams(pagination)
    });
  }
}
