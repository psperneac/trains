import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { AbstractActions } from '../../../helpers/abstract.actions';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import {
  AbstractEntityState,
  createAdapter,
  createInitialState,
  defaultCreateReducer
} from '../../../helpers/abstract.reducer';
import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import { VehicleDto } from '../../../models/vehicle.model';
import { AppState } from '../../../store';
import { VehicleService } from '../services/vehicle.service';

class VehicleActionsType extends AbstractActions<VehicleDto> {
  constructor() {
    super('Vehicle');
  }
}

export const VehicleActions = new VehicleActionsType();

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

export interface VehicleState extends AbstractEntityState<VehicleDto> {
}

export const vehiclesAdapter = createAdapter<VehicleDto>();
const vehicleInitialState = createInitialState(vehiclesAdapter);
const vehicleReducer = defaultCreateReducer(VehicleActions, vehiclesAdapter, vehicleInitialState);

export function reducer(state: VehicleState | undefined, actions: Action) {
  return vehicleReducer(state, actions);
}

const selectors = vehiclesAdapter.getSelectors();
const featureState = (state: AppState) => state['vehicles'] as VehicleState;

export class VehicleSelectorsType extends AbstractSelectors<VehicleState, VehicleDto> {
  constructor() {
    super(featureState, selectors);
  }
}

export const VehicleSelectors = new VehicleSelectorsType();
