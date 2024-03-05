import { inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { MapPlaceConnectionActions, MapPlaceConnectionSelectors } from '../store/map-place-connection.store';

@Injectable({ providedIn: 'root' })
export class MapPlaceConnectionDataService {

  mapPlaceConnectionsLoaded$ = this.store.pipe(select(MapPlaceConnectionSelectors.Loaded));
  mapPlaceConnections$ = this.store.pipe(select(MapPlaceConnectionSelectors.All));
  mapPlaceConnectionsByMapId$ = (mapId: string) => this.store.pipe(select(MapPlaceConnectionSelectors.ByMapId(mapId)));

  constructor(private readonly store: Store<{}>) {}

  resolveMapPlaceConnections() {
    return this.store.pipe(
      select(MapPlaceConnectionSelectors.All),
      withLatestFrom(
        this.store.pipe(select(MapPlaceConnectionSelectors.Loading)),
        this.store.pipe(select(MapPlaceConnectionSelectors.Loaded)),
      ),
      tap(([data, loading, loaded]) => {
        console.log('MapPlaces: ', data, loading, loaded);
        if ((!data && !loading) || (!loading && !loaded)) {
          this.store.dispatch(MapPlaceConnectionActions.getAll({ request: { unpaged: true } }));
        }
      }),
      map(([data, _loading, _loaded]) => data),
      filter(data => !!data),
    );
  }

  createMapPlaceConnection() {
    this.store.dispatch(MapPlaceConnectionActions.selectOne({ payload: {
        mapId: '',
        placeConnectionId: '',
      }}));
    return true;
  }

  loadOneMapPlaceConnection(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id');
    this.store.dispatch(MapPlaceConnectionActions.getOne({ uuid: id }));
    return true;
  }
}

export const mapPlaceConnectionsResolveFn =
  () => inject(MapPlaceConnectionDataService).resolveMapPlaceConnections();

export const createMapPlaceConnectionGuardFn =
  () => inject(MapPlaceConnectionDataService).createMapPlaceConnection();

export const loadOneMapPlaceConnectionGuardFn =
  (route: ActivatedRouteSnapshot) =>
    inject(MapPlaceConnectionDataService).loadOneMapPlaceConnection(route);

