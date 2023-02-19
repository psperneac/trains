import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { LoadOneGuard } from "../../guards/load-one.guard";
import { AppState } from "../../store";
import { PlaceTypeActions } from "./store/place-type.actions";

@Injectable({
  providedIn: 'root'
})
export class LoadOnePlaceTypeGuard extends LoadOneGuard {
  constructor(store: Store<AppState>) {
    super(store, (id: string) => PlaceTypeActions.getOne({uuid: id}));
  }
}
