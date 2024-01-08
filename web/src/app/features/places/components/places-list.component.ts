import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AbstractListComponent } from '../../../helpers/abstract-list.component';
import { AppState } from '../../../store';
import { PlaceDto } from '../../../models/place.model';
import { PlaceActions, PlaceSelectors, PlacesState } from '../store';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../components/confirm-dialog/confirm.dialog';

@Component({
  selector: 'trains-places-list',
  templateUrl: './places-list.component.html',
  styleUrls: ['./places-list.component.scss'],
})
export class PlacesListComponent extends AbstractListComponent<PlacesState, PlaceDto> implements OnInit {
  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;
  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  entities$ = this.store.pipe(select(PlaceSelectors.All));

  public displayColumns = ['name', 'description', 'type', 'lat', 'lng', 'actions'];
  public filterColumns = [];

  constructor(
    readonly store: Store<AppState>,
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) {
    super(PlaceActions, PlaceSelectors, store);
  }

  ngOnInit(): void {}

  getPaginator(): MatPaginator {
    return this.paginator;
  }

  addPlace() {
    this.router.navigateByUrl('/places/create');
  }

  deletePlace(placeId: string) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'page.place.deleteTitle',
        message: 'page.place.deleteMessage',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(PlaceActions.delete({ uuid: placeId }));
      }
    });
  }
}
