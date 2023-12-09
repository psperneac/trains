import { Injectable } from "@angular/core";
import { VehicleTypeState } from "./vehicle-type.reducer";
import { VehicleTypeDto } from "../../../models/vehicle-type.model";
import { AbstractEffects } from "../../../helpers/abstract.effects";
import { VehicleTypeService } from "../services/vehicle-type.service";
import { AppState } from "../../../store";
import { VehicleTypeActions } from "./vehicle-type.actions";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { Router } from "@angular/router";
import { VehicleTypeSelectors } from "./vehicle-type.selectors";

@Injectable()
export class VehicleTypeEffects extends AbstractEffects<VehicleTypeState, VehicleTypeDto> {
  constructor(
    readonly actions$: Actions,
    readonly service: VehicleTypeService,
    readonly store: Store<AppState>,
    readonly router: Router
  ) {
    super(actions$, service, store, router, VehicleTypeActions, VehicleTypeSelectors);
  }
}
