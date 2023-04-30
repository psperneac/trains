import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../store';
import { Injectable } from '@angular/core';
import { VehicleTypeActions } from './store/vehicle-type.actions';

@Injectable({
  providedIn: 'root'
})
export class CreateOneVehicleTypeGuard implements CanActivate {
  constructor(
    private store: Store<AppState>
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot) {
    this.store.dispatch(VehicleTypeActions.selectOne({ payload: {
      type: '',
      name: '',
      description: '',
      content: {},
    }}));
    return true;
  }
}
