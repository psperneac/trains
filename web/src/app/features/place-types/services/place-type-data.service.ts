import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, ResolveFn } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { filter, map, Observable, tap, withLatestFrom } from 'rxjs';
import { PlaceTypeDto } from '../../../models/place-type.model';
import { VehicleActions } from '../../vehicles/store';
import { PlaceTypeActions } from '../store/place-type.actions';
import { PlaceTypeSelectors } from '../store/place-type.selectors';

@Injectable({
  providedIn: 'root'
})
export class PlaceTypeDataService {
  constructor(private store: Store<{}>) {
  }

  resolvePlaceTypes(): Observable<PlaceTypeDto[]> {
    return this.store.pipe(
      select(PlaceTypeSelectors.All),
      withLatestFrom(this.store.pipe(select(PlaceTypeSelectors.Loading))),
      tap(([data, loading]) => {
        if ((!data || data.length === 0) && !loading) {
          this.store.dispatch(PlaceTypeActions.getAll({ request: { unpaged: true }}));
        }
      }),
      filter(([data, _loading]) => !!data && data.length > 0),
      map(([data, _loading]) => data)
    );
  }

  canActivateCreatePlaceType(route: ActivatedRouteSnapshot) {
    this.store.dispatch(PlaceTypeActions.selectOne({ payload: {
        type: '',
        name: '',
        description: '',
        content: {},
      }}));
    return true;
  }

  canActivateLoadOnePlaceType(route: ActivatedRouteSnapshot): boolean {
    const id = route.paramMap.get('id');
    this.store.dispatch(PlaceTypeActions.getOne({ uuid: id }));
    return true;
  }
}

export const resolvePlaceTypesFn: ResolveFn<PlaceTypeDto[]> =
  (_route, _state) =>
    inject(PlaceTypeDataService).resolvePlaceTypes();

export const canActivateCreatePlaceTypeFn: CanActivateFn =
  (route, _state) =>
    inject(PlaceTypeDataService).canActivateCreatePlaceType(route);

export const canActivateLoadOnePlaceTypeFn: CanActivateFn =
  (route, _state) =>
    inject(PlaceTypeDataService).canActivateLoadOnePlaceType(route);
