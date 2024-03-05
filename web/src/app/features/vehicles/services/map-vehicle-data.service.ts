import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable, tap } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { MapVehicleDto } from '../../../models/map-vehicle.model';
import { MapVehicleActions, MapVehicleSelectors } from '../store';

@Injectable({ providedIn: 'root' })
export class MapVehicleDataService {

  mapVehicleLoaded$ = this.store.pipe(select(MapVehicleSelectors.Loaded));
  mapVehicles$ = this.store.pipe(select(MapVehicleSelectors.All));
  mapVehiclesByMapId$ = (mapId: string) => this.store.pipe(select(MapVehicleSelectors.ByMapId(mapId)));

  constructor(private readonly store: Store<{}>) {}

  resolveMapVehicles(): Observable<MapVehicleDto[]> {
    return this.store.pipe(
      select(MapVehicleSelectors.All),
      withLatestFrom(
        this.store.pipe(select(MapVehicleSelectors.Loading)),
        this.store.pipe(select(MapVehicleSelectors.Loaded)),
      ),
      tap(([data, loading, loaded]) => {
        console.log('MapVehicles: ', data, loading, loaded);
        if ((!data && !loading) || (!loading && !loaded)) {
          this.store.dispatch(MapVehicleActions.getAll({ request: { unpaged: true } }));
        }
      }),
      map(([data, _loading, _loaded]) => data),
      filter(data => !!data),
    );
  }

  createMapVehicle() {
    this.store.dispatch(MapVehicleActions.selectOne({ payload: {
        vehicleId: '',
        mapId: '',
      }}));
    return true;
  }

  loadOneMapVehicle(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id');
    this.store.dispatch(MapVehicleActions.getOne({ uuid: id }));
    return true;
  }
}

export const mapVehiclesResolverFn = () => inject(MapVehicleDataService).resolveMapVehicles();
export const createMapVehicleGuardFn = () => inject(MapVehicleDataService).createMapVehicle();
export const loadOneMapVehicleGuardFn = (route: ActivatedRouteSnapshot) =>
  inject(MapVehicleDataService).loadOneMapVehicle(route);
