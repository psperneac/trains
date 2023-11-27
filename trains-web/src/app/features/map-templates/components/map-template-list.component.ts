import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { ConfirmDialog } from '../../../components/confirm-dialog/confirm.dialog';
import { AbstractListComponent } from '../../../helpers/abstract-list.component';
import { MapTemplateDto } from '../../../models/map-template.model';
import { AppState } from '../../../store';
import { MapTemplateActions, MapTemplateSelectors, MapTemplateState } from '../store';

@Component({
  selector: 'trains-map-template-list',
  templateUrl: './map-template-list.component.html',
  styleUrls: ['./map-template-list.component.scss'],
})
export class MapTemplateListComponent
  extends AbstractListComponent<MapTemplateState, MapTemplateDto> implements OnInit {

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  entities$ = this.store.pipe(select(MapTemplateSelectors.All));
  total$ = this.store.pipe(select(MapTemplateSelectors.TotalCount));
  page$ = this.store.pipe(select(MapTemplateSelectors.Page));

  maps$ = this.entities$;   // TODO: add places and connections when available

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
    super(MapTemplateActions, MapTemplateSelectors, store);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  getPaginator(): MatPaginator {
    return undefined;
  }

  addMapTemplate() {
    this.router.navigate(['map-templates', 'create']);
  }

  deleteMapTemplate(uuid) {
    this.dialog.open(ConfirmDialog, {
      data: {
        title: 'page.mapTemplate.deleteTitle',
        message: 'page.mapTemplate.deleteMessage'
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(MapTemplateActions.delete({ uuid }));
      }
    })
  }
}
