import { Injectable } from '@angular/core';
import { AbstractService } from '../../../helpers/abstract.service';
import { MapPlaceDto } from '../../../models/map-place.model';
import { HttpClient } from '@angular/common/http';
import { PageRequestDto } from '../../../models/pagination.model';
import urljoin from 'url-join';
import { PageDto } from '../../../models/page.model';
import { toParams } from '../../../helpers/http.helpers';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root'})
export class MapPlaceService extends AbstractService<MapPlaceDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, '/api/map-places');
  }

  getAllByMap(pagination: PageRequestDto, mapId: string) {
    return this.httpClient.get<PageDto<MapPlaceDto>>(urljoin(environment.api, this.path, 'by-map', mapId), {
      params: toParams(pagination)
    });
  }
}
