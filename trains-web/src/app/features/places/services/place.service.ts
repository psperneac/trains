import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { toParams } from '../../../helpers/http.helpers';
import {PageDto} from "../../../models/page.model";
import {PlaceDto} from "../../../models/place.model";
import {PageRequestDto} from "../../../models/pagination.model";
import {environment} from "../../../../environments/environment";
import * as urljoin from 'url-join';

@Injectable()
export class PlaceService {
  constructor(private httpClient: HttpClient) {
  }

  getAll(pagination: PageRequestDto): Observable<PageDto<PlaceDto>> {
    return this.httpClient.get<PageDto<PlaceDto>>(urljoin(environment.api, '/api/places'), {
      params: toParams(pagination)
    });
  }

  get(uuid: string): Observable<PlaceDto> {
    return this.httpClient.get<PlaceDto>(urljoin(environment.api, 'api/places', uuid));
  }

  create(place: PlaceDto): Observable<PlaceDto> {
    return this.httpClient.post<PlaceDto>(urljoin(environment.api, 'api/places'), place);
  }

  update(uuid: string, place: PlaceDto): Observable<PlaceDto> {
    return this.httpClient.put<PlaceDto>(urljoin(environment.api, 'api/places', uuid), place);
  }

  delete(uuid: string): Observable<boolean> {
    return this.httpClient.delete<boolean>(urljoin(environment.api, 'api/places', uuid));
  }
}
