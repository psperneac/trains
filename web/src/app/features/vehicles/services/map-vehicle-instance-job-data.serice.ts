import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { JobType, PayType } from '../../../models/job.model';
import { MapVehicleInstanceJobActions, MapVehicleInstanceJobSelectors } from '../store/map-vehicle-instance-job.store';

@Injectable({ providedIn: 'root' })
export class MapVehicleInstanceJobDataService {

  mapVehicleInstanceJobsLoaded$ = this.store.pipe(select(MapVehicleInstanceJobSelectors.Loaded));
  mapVehicleInstanceJobs$ = this.store.pipe(select(MapVehicleInstanceJobSelectors.All));
  mapVehicleInstanceJobsByPlayerAndMapId$ = (playerId: string, mapId: string) => this.store.pipe(select(MapVehicleInstanceJobSelectors.ByPlayerAndMap(playerId, mapId)));
  mapVehicleInstanceJobsByVehicleId$ = (vehicleId: string) => this.store.pipe(select(MapVehicleInstanceJobSelectors.ByVehicle(vehicleId)));

  constructor(private readonly store: Store<{}>) {
  }

  resolveMapVehicleInstanceJobs() {
    return this.store.pipe(
      select(MapVehicleInstanceJobSelectors.All),
      withLatestFrom(
        this.store.pipe(select(MapVehicleInstanceJobSelectors.Loading)),
        this.store.pipe(select(MapVehicleInstanceJobSelectors.Loaded)),
      ),
      tap(([data, loading, loaded]) => {
        console.log('MapVehicleInstanceJobs: ', data, loading, loaded);
        if ((!data && !loading) || (!loading && !loaded)) {
          this.store.dispatch(MapVehicleInstanceJobActions.getAll({ request: { unpaged: true } }));
        }
      }),
      map(([data, _loading, _loaded]) => data),
      filter(data => !!data),
    );
  }

  createMapVehicleInstanceJob() {
    this.store.dispatch(MapVehicleInstanceJobActions.selectOne({ payload: {
        name: '',
        description: '',
        type: JobType.DELIVERY,
        startId: '',
        endId: '',
        load: 0,
        payType: PayType.GOLD,
        pay: 0,
        startTime: '',
        mapId: '',
        playerId: '',
        mapVehicleInstanceId: '',
        content: {},
      }}));
    return true;
  }

  loadOneMapVehicleInstanceJob(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id');
    this.store.dispatch(MapVehicleInstanceJobActions.getOne({ uuid: id }));
    return true;
  }
}

export const mapVehicleInstanceJobsResolveFn = () => inject(MapVehicleInstanceJobDataService).resolveMapVehicleInstanceJobs();
export const createMapVehicleInstanceJobGuardFn = () => inject(MapVehicleInstanceJobDataService).createMapVehicleInstanceJob();
export const loadOneMapVehicleInstanceJobGuardFn = (route: ActivatedRouteSnapshot) =>
    inject(MapVehicleInstanceJobDataService).loadOneMapVehicleInstanceJob(route);
