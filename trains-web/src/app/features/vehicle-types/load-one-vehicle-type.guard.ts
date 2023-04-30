import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { LoadOneGuard } from "../../guards/load-one.guard";
import { AppState } from "../../store";
import { VehicleTypeActions } from "./store/vehicle-type.actions";

@Injectable({
  providedIn: 'root'
})
export class LoadOneVehicleTypeGuard extends LoadOneGuard {
  constructor(store: Store<AppState>) {
    super(store, (id: string) => VehicleTypeActions.getOne({uuid: id}));
  }
}
