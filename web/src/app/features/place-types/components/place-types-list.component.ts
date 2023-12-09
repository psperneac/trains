import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { Router } from "@angular/router";
import { select, Store } from "@ngrx/store";
import { AbstractListComponent } from "../../../helpers/abstract-list.component";
import { PlaceTypeDto } from "../../../models/place-type.model";
import { AppState } from "../../../store";
import { PlaceTypeActions } from "../store/place-type.actions";
import { PlaceTypesState } from "../store/place-type.reducer";
import { PlaceTypeSelectors } from "../store/place-type.selectors";

@Component({
  selector: 'trains-place-types-list',
  templateUrl: './place-types-list.component.html',
  styleUrls: ['./place-types-list.component.scss']
})
export class PlaceTypesListComponent extends AbstractListComponent<PlaceTypesState, PlaceTypeDto> {
  @ViewChild(MatSort, {static: true})
  sort: MatSort;

  entities$ = this.store.pipe(select(PlaceTypeSelectors.All));
  total$ = this.store.pipe(select(PlaceTypeSelectors.TotalCount));
  page$ = this.store.pipe(select(PlaceTypeSelectors.Page));

  public displayColumns = [
    'name',
    'type',
    'description',
  ];
  public filterColumns = [];

  constructor(
    readonly store: Store<AppState>,
    private readonly router: Router
  ) {
    super(PlaceTypeActions, PlaceTypeSelectors, store);
  }

  getPaginator(): MatPaginator {
    return null;
  }
}
