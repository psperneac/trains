import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import urljoin from 'url-join';
import { environment } from '../../../../environments/environment';
import { AbstractService } from '../../../helpers/abstract.service';
import { toParams } from '../../../helpers/http.helpers';
import { PageDto } from '../../../models/page.model';
import { MapPlaceInstanceDto } from '../../../models/place.model';

@Injectable()
export class MapPlaceInstanceService extends AbstractService<MapPlaceInstanceDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, 'api/map-place-instances');
  }

  getAllByPlayerAndMap(pagination: any, playerId: string, mapId: string) {
    return this.httpClient.get<PageDto<MapPlaceInstanceDto>>(urljoin(environment.api, this.path, 'by-player-and-map', playerId, mapId), {
      params: toParams(pagination)
    });
  }
}
