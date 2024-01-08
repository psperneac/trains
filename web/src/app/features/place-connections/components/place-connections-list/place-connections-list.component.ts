import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { keyBy } from 'lodash-es';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AbstractListComponent } from '../../../../helpers/abstract-list.component';
import { PlaceConnectionDto } from '../../../../models/place-connection.model';
import { AppState } from '../../../../store';
import { PlaceSelectors } from '../../../places/store';
import { PlaceConnectionActions, PlaceConnectionSelectors, PlaceConnectionState } from '../../store';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../../components/confirm-dialog/confirm.dialog';

@Component({
  selector: 'trains-place-connections-list',
  templateUrl: './place-connections-list.component.html',
  styleUrl: './place-connections-list.component.scss',
})
// @ts-ignore
export class PlaceConnectionsListComponent
  extends AbstractListComponent<PlaceConnectionState, PlaceConnectionDto>
  implements OnInit
{
  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  places$ = this.store.pipe(
    select(PlaceSelectors.All),
    map((places) => keyBy(places, (place) => place.id)),
  );

  entities$ = this.store.pipe(select(PlaceConnectionSelectors.All));
  total$ = this.store.pipe(select(PlaceConnectionSelectors.TotalCount));
  page$ = this.store.pipe(select(PlaceConnectionSelectors.Page));

  connectionsWithPlaces$ = combineLatest([this.entities$, this.places$]).pipe(
    map(([connections, places]) => {
      if (!connections || !places) {
        return connections ?? [];
      }

      return connections.map((conn) => ({
        ...conn,
        start: places[conn.startId],
        end: places[conn.endId],
      }));
    }),
  );

  public displayColumns = ['name', 'type', 'description', 'start', 'end', 'actions'];

  public filterColumns = [];

  constructor(
    private readonly store: Store<AppState>,
    private readonly router: Router,
    private readonly dialog: MatDialog,
  ) {
    super(PlaceConnectionActions, PlaceConnectionSelectors, store);
  }

  ngOnInit() {}

  getPaginator(): MatPaginator {
    return undefined;
  }

  addPlaceConnection() {
    this.router.navigateByUrl('/place-connections/create');
  }

  deletePlaceConnection(placeConnectionId: string) {
    this.dialog.open(ConfirmDialog, {
      data: {
        title: 'page.placeConnection.deleteTitle',
        message: 'page.placeConnection.deleteMessage',
      },
    }).afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(PlaceConnectionActions.delete({ uuid: placeConnectionId }));
      }
    })
  }
}
