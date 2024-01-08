import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { cloneDeep, isNil } from 'lodash-es';
import { Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { VehicleDto } from '../../../models/vehicle.model';
import { UiService } from '../../../services/ui.service';
import { AppState } from '../../../store';
import { VEHICLES } from '../../../utils/constants';
import { VehicleFormComponent } from '../components/vehicle-form/vehicle-form.component';
import { VehicleActions } from '../store';
import { VehicleSelectors } from '../store';

@Component({
  selector: 'trains-vehicle-edit-page',
  templateUrl: './vehicle-edit.page.html',
  styleUrls: ['./vehicle-edit.page.scss']
})
export class VehicleEditPage implements OnInit, OnDestroy {
  destroy$ = new Subject();

  vehicle: VehicleDto;

  @ViewChild('vehicleForm')
  form: VehicleFormComponent;

  constructor(
    private readonly store: Store<AppState>,
    private readonly router: Router,
    private readonly uiService: UiService
  ) {}

  ngOnInit() {
    this.store.pipe(
      select(VehicleSelectors.Selected),
      filter(vehicle => !isNil(vehicle)),
      take(1)
    ).subscribe(vehicle => {
      this.vehicle = cloneDeep(vehicle);
      if (this.vehicle.id) {
        this.uiService.setPageTitle('page.vehicle.editTitle');
      } else {
        this.uiService.setPageTitle('page.vehicle.createTitle');
      }
    })
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }

  onCancel() {
    this.router.navigateByUrl(VEHICLES);
  }

  onSave() {
    if (this.vehicle.id) {
      this.store.dispatch(VehicleActions.update({ payload: this.vehicle }));
    } else {
      this.store.dispatch(VehicleActions.create({ payload: this.vehicle }));
    }
  }

  vehicleChanged($event: VehicleDto) {
    this.vehicle = { ...this.vehicle, ...$event };
  }
}
