import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractSelectors } from './abstract.selectors';
import { AppState } from '../store';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { AbstractActions } from './abstract.actions';
import { take, takeUntil } from 'rxjs/operators';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { PAGE_SIZE } from '../utils/constants';
import { AbstractEntityState } from './abstract.reducer';
import { AbstractEntity } from './abstract.entity';
import { Sort } from '@angular/material/sort';
import { SortDirection } from '@angular/material/sort';

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
  sortDirection: SortDirection;
  filter = '';

  protected constructor(
    public actions: AbstractActions<T>,
    public selectors: AbstractSelectors<S, T>,
    public store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.page$.pipe(take(1)).subscribe(value => {
      if (!this.isUnpaged()) {
        this.getPaginator().pageIndex = value || 0;
      }
    });

    this.pageSize$.pipe(take(1)).subscribe(value => {
      if (!this.isUnpaged()) {
        this.getPaginator().pageIndex = value || PAGE_SIZE;
      }
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
      if (!this.isUnpaged()) {
        this.getPaginator().length = value;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  applyFilter(value: string) {
    this.filter = value;
    if (!this.isUnpaged()) {
      this.getPaginator().pageIndex = 0;
    }
    this.loadEntities(0);
  }

  pageEvent(event: PageEvent) {
    this.loadEntities(event.pageIndex);
  }

  sortData($event: Sort) {
    this.sortColumn = $event.active;
    this.sortDirection = $event.direction;
    this.loadEntities(this.isUnpaged() ? this.getPaginator().pageIndex : 0);
  }

  loadEntities(page: number) {
    this.store.dispatch(
      this.actions.getAll({ request: {
          unpaged: this.isUnpaged() ? true : undefined,
          page: this.isUnpaged() ? 0 : page + 1,
          sortColumn: this.sortDirection === '' ? undefined : this.sortColumn,
          sortDescending: this.sortDirection === '' ? undefined : this.sortDirection === 'desc',
          filter: this.filter
      }})
    )
  }

  isUnpaged() { 
    return !this.getPaginator();
  }

  abstract getPaginator(): MatPaginator;
}
