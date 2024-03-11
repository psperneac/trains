import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { MapVehicleInstanceActions, MapVehicleInstanceSelectors } from '../store/map-vehicle-instance.store';

@Injectable({ providedIn: 'root' })
export class MapVehicleInstanceDataService {

  mapVehicleInstancesLoaded$ = this.store.pipe(select(MapVehicleInstanceSelectors.Loaded));
  mapVehicleInstances$ = this.store.pipe(select(MapVehicleInstanceSelectors.All));
  mapVehicleInstancesByPlayerAndMapId$ = (playerId: string, mapId: string) => this.store.pipe(select(MapVehicleInstanceSelectors.ByPlayerAndMap(playerId, mapId)));
  mapVehicleInstancesByVehicleId$ = (vehicleId: string) => this.store.pipe(select(MapVehicleInstanceSelectors.ByVehicle(vehicleId)));

  constructor(private readonly store: Store<{}>) {
  }

  resolveMapVehicleInstances() {
    return this.store.pipe(
      select(MapVehicleInstanceSelectors.All),
      withLatestFrom(
        this.store.pipe(select(MapVehicleInstanceSelectors.Loading)),
        this.store.pipe(select(MapVehicleInstanceSelectors.Loaded)),
      ),
      tap(([data, loading, loaded]) => {
        console.log('MapVehicleInstances: ', data, loading, loaded);
        if ((!data && !loading) || (!loading && !loaded)) {
          this.store.dispatch(MapVehicleInstanceActions.getAll({ request: { unpaged: true } }));
        }
      }),
      map(([data, _loading, _loaded]) => data),
      filter(data => !!data),
    );
  }

  createMapVehicleInstance() {
    this.store.dispatch(MapVehicleInstanceActions.selectOne({ payload: {
        startId: '',
        endId: '',
        startTime: '',
        endTime: '',
        mapId: '',
        playerId: '',
        mapVehicleId: '',
        jobs: [],
        content: {},
      }}));
    return true;
  }

  loadOneMapVehicleInstance(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id');
    this.store.dispatch(MapVehicleInstanceActions.getOne({ uuid: id }));
    return true;
  }
}

export const mapVehicleInstancesResolveFn = () => inject(MapVehicleInstanceDataService).resolveMapVehicleInstances();
export const createMapVehicleInstanceGuardFn = () => inject(MapVehicleInstanceDataService).createMapVehicleInstance();
export const loadOneMapVehicleInstanceGuardFn = (route: ActivatedRouteSnapshot) =>
    inject(MapVehicleInstanceDataService).loadOneMapVehicleInstance(route);
