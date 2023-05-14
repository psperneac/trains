import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { AbstractListComponent } from '../../../../helpers/abstract-list.component';
import { VehicleDto } from '../../../../models/vehicle.model';
import { AppState } from '../../../../store';
import { VehicleActions } from '../../store/vehicle.actions';
import { VehicleState } from '../../store/vehicle.reducer';
import { VehicleSelectors } from '../../store/vehicle.selectors';

@Component({
  selector: 'trains-vehicles-list',
  templateUrl: './vehicles-list.component.html',
  styleUrls: ['./vehicles-list.component.scss']
})
export class VehiclesListComponent extends AbstractListComponent<VehicleState, VehicleDto>
  implements OnInit {

  @ViewChild(MatSort, {static: true })
  sort: MatSort;

  entities$ = this.store.pipe(select(VehicleSelectors.All));
  total$ = this.store.pipe(select(VehicleSelectors.TotalCount));
  page$ = this.store.pipe(select(VehicleSelectors.Page));

  public displayColumns = [
    'name',
    'type',
    'description',
    'details'
  ]

  public filterColumns = [];

  constructor(
    readonly store: Store<AppState>,
    private readonly router: Router
  ) {
    super(VehicleActions, VehicleSelectors, store);
  }

  ngOnInit() {
    this.store.dispatch(VehicleActions.getAll({ request: {
        unpaged: true,
        sortColumn: this.sortColumn,
        sortDescending: this.sortDirection === 'desc',
        filter: ''
    }}));
  }

  getPaginator(): MatPaginator {
    return null;
  }

  addVehicle() {
    this.router.navigateByUrl('/vehicles/create');
  }

  getDetails(item: VehicleDto) {
    return `Max: ${item.engineMax}/${item.auxMax}, Load: ${item.engineLoad}/${item.auxLoad}, Fuel: ${item.engineFuel}/${item.auxFuel}, Speed: ${item.speed}`;
  }
}
