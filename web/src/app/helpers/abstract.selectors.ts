import { AppState } from '../store';
import { createSelector, MemoizedSelector } from '@ngrx/store';
import { Dictionary, EntityState } from '@ngrx/entity';
import { PageRequestDto } from '../models/pagination.model';
import { EntitySelectors } from '@ngrx/entity/src/models';
import { AbstractEntityState } from './abstract.reducer';

export abstract class AbstractSelectors<S extends AbstractEntityState<T>, T> {
  public Ids: MemoizedSelector<AppState, string[] | number[]>;
  public All: MemoizedSelector<AppState, T[]>;
  public Entities: MemoizedSelector<AppState, Dictionary<T>>;
  public Loading: MemoizedSelector<AppState, boolean>;
  public Loaded: MemoizedSelector<AppState, boolean>;
  public Error: MemoizedSelector<AppState, any>;

  public TotalCount: MemoizedSelector<AppState, number>;
  public Limit: MemoizedSelector<AppState, number>;
  public Page: MemoizedSelector<AppState, number>;
  public Filter: MemoizedSelector<AppState, string>;
  public SortColumn: MemoizedSelector<AppState, string>;
  public SortDirection: MemoizedSelector<AppState, string>;

  public CurrentPageRequest: MemoizedSelector<AppState, PageRequestDto>;

  public SelectedLoading: MemoizedSelector<AppState, boolean>;
  public SelectedLoaded: MemoizedSelector<AppState, boolean>;
  public Selected: MemoizedSelector<AppState, T>;

  constructor(
    fState: (state: AppState) => any,
    selectors: EntitySelectors<T, EntityState<T>>) {
    this.Ids = createSelector(fState, selectors.selectIds);
    this.All = createSelector(fState, selectors.selectAll);
    this.Entities = createSelector(fState, selectors.selectEntities);
    this.Loading = createSelector(fState, (state: S) => state.loading);
    this.Loaded = createSelector(fState, (state: S) => state.loaded);
    this.Error = createSelector(fState, (state: S) => state.error);
    this.TotalCount = createSelector(fState, (state: S) => state.totalCount);
    this.Limit = createSelector(fState, (state: S) => state.limit);
    this.Page = createSelector(fState, (state: S) => state.page);
    this.Filter = createSelector(fState, (state: S) => state.filter);
    this.SortColumn = createSelector(fState, (state: S) => state.sortColumn);
    this.SortDirection = createSelector(fState, (state: S) => state.sortDescending ? 'desc' : 'asc');
    this.CurrentPageRequest = createSelector(fState, (state: S) =>
      ({
        page: state.page,
        limit: state.limit,
        sortColumn: state.sortColumn,
        sortDescending: state.sortDescending,
        filter: state.filter
      } as PageRequestDto)
    );

    this.SelectedLoading = createSelector(fState, (state: S) => state.selectedLoading);
    this.SelectedLoaded = createSelector(fState, (state: S) => state.selectedLoaded);
    this.Selected = createSelector(fState, (state: S) => state.selected);
  }
}
