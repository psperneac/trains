import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable, tap } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { VehicleDto } from '../../../models/vehicle.model';
import { VehicleActions, VehicleSelectors } from '../store';

@Injectable({ providedIn: 'root' })
export class VehicleDataService {
  constructor(private readonly store: Store<{}>) {}

  resolveVehicles(): Observable<VehicleDto[]> {
    return this.store.pipe(
      select(VehicleSelectors.All),
      withLatestFrom(this.store.pipe(select(VehicleSelectors.Loading))),
      tap(([data, loading]) => {
        if ((!data || data.length === 0) && !loading) {
          this.store.dispatch(VehicleActions.getAll({ request: { unpaged: true } }));
        }
      }),
      map(([data, _loading]) => data),
      filter(data => !!data && data.length > 0),
    );
  }

  createVehicle(): boolean {
    this.store.dispatch(VehicleActions.selectOne({ payload: {
        type: '',
        name: '',
        description: '',
        content: {},
        engineMax: 1,
        engineFuel: 100,
        engineLoad: 4,
        auxMax: 0,
        auxFuel: 0,
        auxLoad: 0,
        speed: 10
      }}));

    return true;
  }

  loadOneVehicle(route: ActivatedRouteSnapshot): boolean {
    const id = route.paramMap.get('id');
    this.store.dispatch(VehicleActions.getOne({ uuid: id }));
    return true;
  }
}

export const vehiclesResolveFn: ResolveFn<any> =
  (_route, _state) =>
    inject(VehicleDataService).resolveVehicles();

export const createVehicleGuardFn: CanActivateFn =
  (_route, _state) =>
    inject(VehicleDataService).createVehicle();

export const loadOneVehicleGuardFn: CanActivateFn =
  (route, _state) =>
    inject(VehicleDataService).loadOneVehicle(route);
