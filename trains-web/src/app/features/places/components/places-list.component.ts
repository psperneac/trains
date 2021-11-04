import { Component, OnInit, ViewChild } from '@angular/core';
import { AppState } from '../../../store';
import { select, Store } from '@ngrx/store';
import { PlaceSelectors } from '../store/place.selectors';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AbstractListComponent } from '../../../helpers/abstract-list.component';
import { PlaceActions } from '../store/place.actions';
import { Router } from '@angular/router';
import {PlaceDto} from "../../../models/place.model";

@Component({
  selector: 'trains-places-list',
  templateUrl: './places-list.component.html',
  styleUrls: ['./places-list.component.scss']
})
export class PlacesListComponent extends AbstractListComponent<PlaceDto> implements OnInit {
  @ViewChild(MatPaginator, {static: true})
  paginator: MatPaginator;
  @ViewChild(MatSort, {static: true})
  sort: MatSort;

  entities$ = this.store.pipe(select(PlaceSelectors.All));

  public displayColumns = [
    'name',
    'description',
    'type',
    'lat',
    'long'
  ];
  public filterColumns = [];

  constructor(
    readonly store: Store<AppState>,
    private readonly router: Router) {
    super(PlaceActions, PlaceSelectors, store);
  }

  ngOnInit(): void {
    this.store.dispatch(PlaceActions.getAll({ request: {
      page: 0,
      limit: 10,
      sortColumn: this.sortColumn,
      sortDescending: false,
      filter: ''}}));
  }

  getPaginator(): MatPaginator {
    return this.paginator;
  }

  addPlace() {
    this.router.navigateByUrl('/places/create');
  }
}
