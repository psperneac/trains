import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import urljoin from 'url-join';
import { environment } from '../../../../environments/environment';
import { AbstractService } from '../../../helpers/abstract.service';
import { toParams } from '../../../helpers/http.helpers';
import { MapVehicleInstanceJobDto } from '../../../models/map-vehicle-instance-job.model';

@Injectable({ providedIn: 'root' })
export class MapVehicleInstanceJobService extends AbstractService<MapVehicleInstanceJobDto> {
  constructor(public httpClient: HttpClient) {
    super(httpClient, '/api/map-vehicle-instance-jobs');
  }

  /**
   * Get all jobs of a player on a map
   *
   * @param pagination
   * @param playerId
   * @param mapId
   */
  getAllByPlayerAndMap(pagination: any, playerId: string, mapId: string) {
    return this.httpClient.get(urljoin(environment.api, this.path, 'by-player-and-map', playerId, mapId), {
      params: toParams(pagination)
    });
  }

  /**
   * Get all jobs on a vehicle instance
   *
   * @param pagination
   * @param vehicleId
   */
  getAllByVehicle(pagination: any, vehicleId: string) {
    return this.httpClient.get(urljoin(environment.api, this.path, 'by-vehicle', vehicleId), {
      params: toParams(pagination)
    });
  }
}
