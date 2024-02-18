import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, ResolveFn } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable, tap } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { PlaceConnectionDto } from '../../../models/place-connection.model';
import { PlaceConnectionActions, PlaceConnectionSelectors } from '../store';

@Injectable({ providedIn: 'root' })
export class PlaceConnectionDataService {

  placeConnectionsLoaded$ = this.store.pipe(select(PlaceConnectionSelectors.Loaded));
  placeConnections$ = this.store.pipe(select(PlaceConnectionSelectors.All));

  constructor(private readonly store: Store<{}>) {}

  resolvePlaceConnections(): Observable<PlaceConnectionDto[]> {
    return this.store.pipe(
      select(PlaceConnectionSelectors.All),
      withLatestFrom(
        this.store.pipe(select(PlaceConnectionSelectors.Loading)),
        this.store.pipe(select(PlaceConnectionSelectors.Loaded)),
      ),
      tap(([data, loading, loaded]) => {
        console.log('PlaceConnectionDataService.resolvePlaceConnections', data, loading);

        if ((!data && !loading) || (!loading && !loaded)) {
          this.store.dispatch(PlaceConnectionActions.getAll({ request: { unpaged: true } }));
        }
      }),
      map(([data, _loading, _loaded]) => data),
      filter(data => !!data),
    );
  }

  createPlaceConnection(_route: ActivatedRouteSnapshot) {
    this.store.dispatch(PlaceConnectionActions.selectOne({ payload: {
        type: '',
        name: '',
        description: '',
        content: {},
        startId: undefined,
        endId: undefined,
      }}));
    return true;
  }

  loadOnePlaceConnection(route: ActivatedRouteSnapshot): boolean {
    const id = route.paramMap.get('id');
    this.store.dispatch(PlaceConnectionActions.getOne({ uuid: id }));
    return true;
  }
}

export const placeConnectionsResolversFn: ResolveFn<PlaceConnectionDto[]> =
  (_route, _state) =>
    inject(PlaceConnectionDataService).resolvePlaceConnections();

export const createPlaceConnectionGuardFn: CanActivateFn =
  (route, _state) =>
    inject(PlaceConnectionDataService).createPlaceConnection(route);

export const loadOnePlaceConnectionGuardFn: CanActivateFn =
  (route, _state) =>
    inject(PlaceConnectionDataService).loadOnePlaceConnection(route);
