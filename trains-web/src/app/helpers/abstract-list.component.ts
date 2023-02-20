import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractSelectors } from './abstract.selectors';
import { AppState } from '../store';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { AbstractActions } from './abstract.actions';
import { take, takeUntil } from 'rxjs/operators';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { PAGE_SIZE } from '../utils/constants';
import { AbstractEntityState } from './abstract.reducer';
import { AbstractEntity } from './abstract.entity';

@Component({
  template: ''
})
export abstract class AbstractListComponent<S extends AbstractEntityState<T>, T extends AbstractEntity> implements OnInit, OnDestroy {
  destroy$ = new Subject();

  page$ = this.store.pipe(select(this.selectors.Page));
  pageSize$ = this.store.pipe(select(this.selectors.Limit));
  filter$ = this.store.pipe(select(this.selectors.Filter));
  sortColumn$ = this.store.pipe(select(this.selectors.SortColumn));
  sortDirection$ = this.store.pipe(select(this.selectors.SortDirection));

  all$ = this.store.pipe(select(this.selectors.All));
  totalCount$ = this.store.pipe(select(this.selectors.TotalCount));
  loaded$ = this.store.pipe(select(this.selectors.Loaded));
  error$ = this.store.pipe(select(this.selectors.Error));

  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  filter = '';

  protected constructor(
    public actions: AbstractActions<T>,
    public selectors: AbstractSelectors<S, T>,
    public store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.page$.pipe(take(1)).subscribe(value => {
      this.getPaginator().pageIndex = value || 0;
    });

    this.pageSize$.pipe(take(1)).subscribe(value => {
      this.getPaginator().pageIndex = value || PAGE_SIZE;
    });

    this.filter$.pipe(take(1)).subscribe(value => {
      this.filter = value || '';
    });

    this.sortColumn$.pipe(take(1)).subscribe(value => {
      this.sortColumn = value || '';
    });

    this.sortDirection$.pipe(take(1)).subscribe(value => {
      this.sortDirection = value ? 'desc' : 'asc';
    });

    this.totalCount$.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.getPaginator().length = value;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  applyFilter(value: string) {
    this.filter = value;
    this.getPaginator().pageIndex = 0;
    this.loadEntities(0);
  }

  pageEvent(event: PageEvent) {
    this.loadEntities(event.pageIndex);
  }

  loadEntities(page: number) {
    this.store.dispatch(
      this.actions.getAll({ request: {
          page,
          limit: this.getPaginator().pageSize,
          sortColumn: this.sortColumn,
          sortDescending: this.sortDirection === 'desc',
          filter: this.filter
      }})
    )
  }

  abstract getPaginator(): MatPaginator;
}
