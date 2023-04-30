import { AppState } from './../../../../store/app-reducers';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { VehicleTypeSelectors } from '../../store/vehicle-type.selectors';
import { VehicleTypeActions } from '../../store/vehicle-type.actions';
import { VehicleTypeState } from '../../store/vehicle-type.reducer';
import { VehicleTypeDto } from '../../../../models/vehicle-type.model';
import { AbstractListComponent } from '../../../../helpers/abstract-list.component';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'trains-vehicle-types-list',
  templateUrl: './vehicle-types-list.component.html',
  styleUrls: ['./vehicle-types-list.component.scss']
})
export class VehicleTypesListComponent extends AbstractListComponent<VehicleTypeState, VehicleTypeDto> implements OnInit {

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  entities$ = this.store.pipe(select(VehicleTypeSelectors.All));
  total$ = this.store.pipe(select(VehicleTypeSelectors.TotalCount));
  page$ = this.store.pipe(select(VehicleTypeSelectors.Page));

  public displayColumns = [
    'name',
    'type',
    'description'
  ];
  public filterColumns = [];

  constructor(
    readonly store: Store<AppState>,
    private readonly router: Router
  ) {
    super(VehicleTypeActions, VehicleTypeSelectors, store);
  }

  ngOnInit() {
    this.store.dispatch(VehicleTypeActions.getAll({ request: {
      unpaged: true,
      sortColumn: this.sortColumn,
      sortDescending: this.sortDirection === 'desc',
      filter: ''
    }}));
  }

  getPaginator(): MatPaginator {
    return null;
  }

  addVehicleType() {
    this.router.navigateByUrl('/vehicle-types/create');
  }
}
