import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import { VehicleDto } from '../../../models/vehicle.model';
import { AppState } from '../../../store';
import { VehicleService } from '../services/vehicle.service';
import { VehicleActions } from './vehicle.actions';
import { VehicleState } from './vehicle.reducer';
import { VehicleSelectors } from './vehicle.selectors';

@Injectable()
export class VehicleEffects extends AbstractEffects<VehicleState, VehicleDto> {
  constructor(
    readonly actions$: Actions,
    readonly service: VehicleService,
    readonly store: Store<AppState>,
    readonly router: Router
  ) {
    super(actions$, service, store, router, VehicleActions, VehicleSelectors);
  }
}
