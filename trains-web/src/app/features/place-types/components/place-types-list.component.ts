import { Component, OnInit, ViewChild } from "@angular/core";
import { MatLegacyPaginator as MatPaginator } from "@angular/material/legacy-paginator";
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
export class PlaceTypesListComponent extends AbstractListComponent<PlaceTypesState, PlaceTypeDto> implements OnInit {
  @ViewChild(MatPaginator, {static: true})
  paginator: MatPaginator;
  @ViewChild(MatSort, {static: true})
  sort: MatSort;

  entities$ = this.store.pipe(select(PlaceTypeSelectors.All));

  public displayColumns = [
    'name',
    'description',
    'type'
  ];
  public filterColumns = [];

  constructor(
    readonly store: Store<AppState>,
    private readonly router: Router
  ) {
    super(PlaceTypeActions, PlaceTypeSelectors, store);
  }

  ngOnInit(): void {
    this.store.dispatch(PlaceTypeActions.getAll({ request: {
      page: 0,
      limit: 10,
      sortColumn: this.sortColumn,
      sortDescending: this.sortDirection === 'desc',
      filter: ''
    }}));
  }

  getPaginator(): MatPaginator {
    return this.paginator;
  }

  addPlaceType() {
    this.router.navigateByUrl('/place-types/create');
  }
}
