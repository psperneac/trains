import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../components/confirm-dialog/confirm.dialog';
import { AbstractListComponent } from '../../../helpers/abstract-list.component';
import { PlayerActions, PlayerSelectors, PlayersState } from '../store';
import { PlayerDto } from '../../../models/player';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../store';
import { Router } from '@angular/router';

@Component({
  selector: 'trains-players-list',
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.scss']
})
export class PlayersListComponent extends AbstractListComponent<PlayersState, PlayerDto> implements OnInit {

  @ViewChild(MatPaginator, {static: true})
  paginator: MatPaginator;
  @ViewChild(MatSort, {static: true})
  sort: MatSort;

  entities$ = this.store.pipe(select(PlayerSelectors.All));

  public displayColumns = [
    'name',
    'description',
    'actions'
  ];

  public filterColumns = [];

  constructor(
    readonly store: Store<AppState>,
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) {
    super(PlayerActions, PlayerSelectors, store);
  }

  ngOnInit(): void {
    this.store.dispatch(PlayerActions.getAll({request: {
        unpaged: true,
        sortColumn: this.sortColumn,
        sortDescending: this.sortDirection === 'desc',
        filter: ''
      }}));
  }

  getPaginator(): MatPaginator {
    return this.paginator;
  }

  addPlayer() {
    this.router.navigateByUrl('/players/create');
  }


  deletePlayer(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'page.player.deleteTitle',
        message: 'page.player.deleteMessage',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(PlayerActions.delete({ uuid: id }));
      }
    });
  }
}
