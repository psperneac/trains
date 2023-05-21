import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, ResolveFn } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { keyBy } from 'lodash';
import { Observable, tap } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { PlaceConnectionDto } from '../../../models/place-connection.model';
import { PlaceConnectionActions, PlaceConnectionSelectors } from '../store';

@Injectable({ providedIn: 'root' })
export class PlaceConnectionDataService {
  constructor(private readonly store: Store<{}>) {}

  resolvePlaceConnections(): Observable<PlaceConnectionDto[]> {
    return this.store.pipe(
      select(PlaceConnectionSelectors.All),
      withLatestFrom(this.store.pipe(select(PlaceConnectionSelectors.Loading))),
      tap(([data, loading]) => {
        if ((!data || data.length === 0) && !loading) {
          this.store.dispatch(PlaceConnectionActions.getAll({ request: { unpaged: true } }));
        }
      }),
      map(([data, _loading]) => data),
      filter(data => !!data && data.length > 0),
    );
  }

  createPlaceConnection(route: ActivatedRouteSnapshot) {
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
