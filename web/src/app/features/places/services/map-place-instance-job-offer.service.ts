import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import urljoin from 'url-join';
import { environment } from '../../../../environments/environment';
import { AbstractService } from '../../../helpers/abstract.service';
import { toParams } from '../../../helpers/http.helpers';
import { MapPlaceInstanceJobOfferDto, PageDto } from '../../../models';

@Injectable({ providedIn: 'root' })
export class MapPlaceInstanceJobOfferService extends AbstractService<MapPlaceInstanceJobOfferDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, '/api/map-place-instance-job-offers');
  }

  /**
   * Get all jobs of a player on a map
   *
   * @param pagination
   * @param playerId
   * @param mapId
   */
  getAllByPlayerAndMap(pagination: any, playerId: string, mapId: string) {
    return this.httpClient.get<PageDto<MapPlaceInstanceJobOfferDto>>(
      urljoin(environment.api, this.path, 'by-player-and-map', playerId, mapId),
      {
        params: toParams(pagination)
      }
    );
  }

  /**
   * Get all jobs on a place instance
   *
   * @param pagination
   * @param placeId
   */
  getAllByPlace(pagination: any, placeId: string) {
    return this.httpClient.get<PageDto<MapPlaceInstanceJobOfferDto>>(
      urljoin(environment.api, this.path, 'by-place', placeId),
      {
        params: toParams(pagination)
      }
    );
  }
}
