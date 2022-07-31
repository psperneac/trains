import { AppState } from '../store';
import { MemoizedSelector } from '@ngrx/store';
import { Dictionary } from '@ngrx/entity';
import { PageRequestDto } from '../models/pagination.model';

export abstract class AbstractSelectors<T> {
  public PlacesState: (state: AppState) => any;
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
}
