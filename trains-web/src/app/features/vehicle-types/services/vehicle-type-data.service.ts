import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, ResolveFn } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { filter, map, Observable, tap, withLatestFrom } from 'rxjs';
import { VehicleTypeDto } from '../../../models/vehicle-type.model';
import { VehicleTypeActions } from '../store/vehicle-type.actions';
import { VehicleTypeSelectors } from '../store/vehicle-type.selectors';

@Injectable({ providedIn: 'root' })
export class VehicleTypeDataService {
  constructor(private readonly store: Store<{}>) {}

  resolveVehicleTypes(): Observable<VehicleTypeDto[]> {
    return this.store.pipe(
      select(VehicleTypeSelectors.All),
      withLatestFrom(this.store.pipe(select(VehicleTypeSelectors.Loading))),
      tap(([data, loading]) => {
        if ((!data || data.length === 0) && !loading) {
          this.store.dispatch(VehicleTypeActions.getAll({ request: { unpaged: true }}));
        }
      }),
      map(([data, _loading]) => data),
      filter(data => !!data && data.length > 0)
    );
  }

  create(): boolean {
    this.store.dispatch(VehicleTypeActions.selectOne({ payload: {
        type: '',
        name: '',
        description: '',
        content: {},
      }}));
    return true;
  }

  loadOne(route: ActivatedRouteSnapshot): boolean {
    const id = route.paramMap.get('id');
    this.store.dispatch(VehicleTypeActions.getOne({ uuid: id }));
    return true;
  }
}

export const vehicleTypesResolveFn: ResolveFn<VehicleTypeDto[]> =
  (_route, _state) =>
    inject(VehicleTypeDataService).resolveVehicleTypes();

export const createVehicleTypeGuardFn: CanActivateFn =
  (_route, _state) =>
    inject(VehicleTypeDataService).create();

export const loadOneVehicleTypeGuardFn: CanActivateFn =
  (route, _state) =>
    inject(VehicleTypeDataService).loadOne(route);
