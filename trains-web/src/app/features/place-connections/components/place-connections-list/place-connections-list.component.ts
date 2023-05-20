import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { keyBy } from 'lodash';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AbstractListComponent } from '../../../../helpers/abstract-list.component';
import { PlaceConnectionDto } from '../../../../models/place-connection.model';
import { AppState } from '../../../../store';
import { PlaceSelectors } from '../../../places/store';
import { PlaceConnectionActions, PlaceConnectionSelectors, PlaceConnectionState } from '../../store';

@Component({
  selector: 'trains-place-connections-list',
  templateUrl: './place-connections-list.component.html',
  styleUrls: ['./place-connections-list.component.scss']
})
// @ts-ignore
export class PlaceConnectionsListComponent extends AbstractListComponent<PlaceConnectionState, PlaceConnectionDto>
  implements OnInit {

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  places$ = this.store.pipe(
    select(PlaceSelectors.All),
    map(places => keyBy(places, place => place.id))
  );

  entities$ = this.store.pipe(select(PlaceConnectionSelectors.All));
  total$ = this.store.pipe(select(PlaceConnectionSelectors.TotalCount));
  page$ = this.store.pipe(select(PlaceConnectionSelectors.Page));

  connectionsWithPlaces$ = combineLatest([this.entities$, this.places$]).pipe(
    map(([connections, places]) => {
      if (!connections || !places) {
        return connections ?? [];
      }

      return connections.map(conn => ({
        ...conn,
        start: places[conn.startId],
        end: places[conn.endId]
      }))
    })
  );

  public displayColumns = [
    'name',
    'type',
    'description',
    'start',
    'end'
  ];

  public filterColumns = [];

  constructor(
    private readonly store: Store<AppState>,
    private readonly router: Router
  ) {
    super(PlaceConnectionActions, PlaceConnectionSelectors, store);
  }

  ngOnInit() {
    this.store.dispatch(PlaceConnectionActions.getAll({ request: {
        unpaged: true,
        sortColumn: this.sortColumn,
        sortDescending: this.sortDirection === 'desc',
        filter: ''
    }}));
  }

  getPaginator(): MatPaginator {
    return null;
  }

  addPlaceConnection() {
    this.router.navigateByUrl('/place-connections/create');
  }
}
