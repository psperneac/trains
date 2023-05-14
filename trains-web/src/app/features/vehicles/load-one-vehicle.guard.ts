import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { LoadOneGuard } from '../../guards/load-one.guard';
import { AppState } from '../../store';
import { VehicleActions } from './store/vehicle.actions';

@Injectable({ providedIn: 'root' })
export class LoadOneVehicleGuard extends LoadOneGuard {
  constructor(store: Store<AppState>) {
    super(store, (id: string) => VehicleActions.getOne({ uuid: id }));
  }
}
