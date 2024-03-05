import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { MapPlaceInstanceActions, MapPlaceInstanceSelectors } from '../store/map-place-instance.store';

@Injectable({ providedIn: 'root' })
export class MapPlaceInstanceDataService {

  mapPlaceInstancesLoaded$ = this.store.pipe(select(MapPlaceInstanceSelectors.Loaded));
  mapPlaceInstances$ = this.store.pipe(select(MapPlaceInstanceSelectors.All));
  mapPlaceInstancesByPlayerAndMapId$ = (playerId: string, mapId: string) => this.store.pipe(select(MapPlaceInstanceSelectors.ByPlayerAndMapId(playerId, mapId)));

  constructor(private readonly store: Store<{}>) {}

  resolveMapPlaceInstances() {
    return this.store.pipe(
      select(MapPlaceInstanceSelectors.All),
      withLatestFrom(
        this.store.pipe(select(MapPlaceInstanceSelectors.Loading)),
        this.store.pipe(select(MapPlaceInstanceSelectors.Loaded)),
      ),
      tap(([data, loading, loaded]) => {
        console.log('MapPlaceInstances: ', data, loading, loaded);
        if ((!data && !loading) || (!loading && !loaded)) {
          this.store.dispatch(MapPlaceInstanceActions.getAll({ request: { unpaged: true } }));
        }
      }),
      map(([data, _loading, _loaded]) => data),
      filter(data => !!data),
    );
  }

  createMapPlaceInstance() {
    this.store.dispatch(MapPlaceInstanceActions.selectOne({ payload: {
        mapId: '',
        playerId: '',
        mapPlaceId: '',
        jobs: [],
        jobOffers: [],
        content: {},
      }}));
    return true;
  }

  loadOneMapPlaceInstance(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id');
    this.store.dispatch(MapPlaceInstanceActions.getOne({ uuid: id }));
    return true;
  }
}

export const mapPlaceInstancesResolveFn = () => inject(MapPlaceInstanceDataService).resolveMapPlaceInstances();
export const createMapPlaceInstanceGuardFn = () => inject(MapPlaceInstanceDataService).createMapPlaceInstance();
export const loadOneMapPlaceInstanceGuardFn = (route: ActivatedRouteSnapshot) =>
    inject(MapPlaceInstanceDataService).loadOneMapPlaceInstance(route);

