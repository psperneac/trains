import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Subject, filter, take } from "rxjs";
import { VehicleTypeDto } from "../../../models/vehicle-type.model";
import { AppState } from "../../../store";
import { Store, select } from "@ngrx/store";
import { Router } from "@angular/router";
import { UiService } from "../../../services/ui.service";
import { VehicleTypeSelectors } from "../store/vehicle-type.selectors";
import { cloneDeep, isNil } from "lodash";
import { VEHICLE_TYPES } from "../../../utils/constants";
import { VehicleTypeActions } from "../store/vehicle-type.actions";
import { VehicleTypeFormComponent } from "../components/vehicle-type-form/vehicle-type-form.component";

@Component({
  selector: 'trains-vehicle-type-create-page',
  templateUrl: './vehicle-type-edit.page.html',
  styleUrls: ['./vehicle-type-edit.page.scss']
})
export class VehicleTypeEditPage implements OnInit, OnDestroy {
  destroy$ = new Subject();

  vehicleType: VehicleTypeDto;

  @ViewChild('vehicleTypeForm')
  form: VehicleTypeFormComponent;

  constructor(
    private readonly store: Store<AppState>,
    private readonly router: Router,
    private readonly uiService: UiService
  ) {
  }

  ngOnInit() {
    this.store.pipe(
      select(VehicleTypeSelectors.Selected),
      filter(vehicleType => !isNil(vehicleType)),
      take(1)
    ).subscribe(vehicleType => {
      this.vehicleType = cloneDeep(vehicleType);
      if (this.vehicleType.id) {
        this.uiService.setPageTitle('page.vehicleType.editTitle');
      } else {
        this.uiService.setPageTitle('page.vehicleType.createTitle');
      }
    });

  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }

  onCancel() {
    this.router.navigateByUrl(VEHICLE_TYPES);
  }

  onSave() {
    if (this.vehicleType.id) {
      this.store.dispatch(VehicleTypeActions.update({payload: this.vehicleType}));
    } else {
      this.store.dispatch(VehicleTypeActions.create({payload: this.vehicleType}));
    }
  }

  vehicleTypeChanged($event: VehicleTypeDto) {
    this.vehicleType = { ...this.vehicleType, ...$event };
  }
}
