import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { AbstractEffects } from "../../../helpers/abstract.effects";
import { PlaceTypeDto } from "../../../models/place-type.model";
import { AppState } from "../../../store";
import { PlaceTypeService } from "../services/place-type.service";
import { PlaceTypeActions } from "./place-type.actions";
import { PlaceTypesState } from "./place-type.reducer";
import { PlaceTypeSelectors } from "./place-type.selectors";

@Injectable()
export class PlaceTypeEffects extends AbstractEffects<PlaceTypesState, PlaceTypeDto> {
  constructor(
    readonly actions$: Actions,
    readonly service: PlaceTypeService,
    readonly store: Store<AppState>,
    readonly router: Router
  ) {
    super(actions$, service, store, router, PlaceTypeActions, PlaceTypeSelectors);
  }
}
