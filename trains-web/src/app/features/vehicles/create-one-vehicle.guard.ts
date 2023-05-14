import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../store';
import { VehicleActions } from './store/vehicle.actions';

@Injectable({ providedIn: 'root' })
export class CreateOneVehicleGuard implements CanActivate {
  constructor(private readonly store: Store<AppState>) {}

  canActivate(route: ActivatedRouteSnapshot) {
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
}
