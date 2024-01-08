import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, ResolveFn } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { keyBy } from 'lodash-es';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PlaceDto } from '../../../models/place.model';
import { PlaceActions, PlaceSelectors } from '../store';

@Injectable({ providedIn: 'root' })
export class PlaceDataService {

  placesLoaded$ = this.store.pipe(select(PlaceSelectors.Loaded));
  places$ = this.store.pipe(select(PlaceSelectors.All));

  constructor(private readonly store: Store<{}>) {}

  resolvePlaces(): Observable<PlaceDto[]> | Promise<PlaceDto[]> | PlaceDto[] {
    return this.placesLoaded$.pipe(
      map(loaded => {
        if (!loaded) {
          this.store.dispatch(PlaceActions.getAll({ request: { unpaged: true } }))
        }
      }),
      switchMap(() => this.places$));
  }

  createPlace(_route: ActivatedRouteSnapshot) {
    this.store.dispatch(PlaceActions.selectOne({ payload: {
        name: '',
        description: '',
        type: '',
        lat: 0,
        lng: 0,
      }}));
    return true;
  }

  loadOneGuard(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id');
    this.store.dispatch(PlaceActions.getOne({ uuid: id }));
    return true;
  }

  placesById$(): Observable<{[key: string]: PlaceDto}> {
    return this.store.pipe(
      select(PlaceSelectors.All),
      map(places => keyBy(places, place => place.id))
    );
  }
}

export const placesResolverFn: ResolveFn<PlaceDto[]> =
  (_route, _state) =>
    inject(PlaceDataService).resolvePlaces();

export const createPlaceGuardFn: CanActivateFn =
  (route, _state) =>
    inject(PlaceDataService).createPlace(route);

export const loadOnePlaceGuardFn: CanActivateFn =
  (route, _state) =>
    inject(PlaceDataService).loadOneGuard(route);
