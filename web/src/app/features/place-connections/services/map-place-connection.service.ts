import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import urljoin from 'url-join';

import { MapPlaceConnectionDto } from "../../../models/map-place-connection.model";
import { AbstractService } from "../../../helpers/abstract.service";
import { PageRequestDto } from "../../../models/pagination.model";
import { PageDto } from "../../../models/page.model";
import { environment } from "../../../../environments/environment";
import { toParams } from "../../../helpers/http.helpers";

@Injectable({ providedIn: 'root' })
export class MapPlaceConnectionService extends AbstractService<MapPlaceConnectionDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, '/api/map-place-connections');
  }

  getAllByMap(pagination: PageRequestDto, mapId: string) {
    return this.httpClient.get<PageDto<MapPlaceConnectionDto>>(urljoin(environment.api, this.path, 'by-map', mapId), {
      params: toParams(pagination)
    });
  }
}
