import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { AbstractEntity } from './abstract.entity';
import { AbstractActions } from './abstract.actions';
import { createReducer, on } from '@ngrx/store';

export interface AbstractEntityState<T extends AbstractEntity> extends EntityState<T> {
  error: any;
  totalCount: number | undefined;
  limit: number;
  page: number;
  filter: string;
  sortColumn: string;
  sortDescending: boolean;
  selected: T;

  loading: boolean;
  loaded: boolean;

  selectedLoading: boolean,
  selectedLoaded: boolean,
}

export type IdSelectorFn = (entity: AbstractEntity) => string;
export const defaultIdSelector: IdSelectorFn = (entity: AbstractEntity): string  => entity.id;

export function createAdapter<T extends AbstractEntity>(idSelector = defaultIdSelector) {
  return createEntityAdapter<T>({
    selectId: idSelector
  });
};

const defaultInitialState = {
  error: undefined,
  totalCount: undefined,
  limit: undefined,
  page: undefined,
  filter: undefined,
  sortColumn: undefined,
  sortDescending: undefined,
  selected: undefined,

  loading: false,
  loaded: false,

  selectedLoading: false,
  selectedLoaded: false,
};

export const createInitialState = (adapter: EntityAdapter<AbstractEntity>, defaults = {}) => {
  return adapter.getInitialState({
    ...defaultInitialState,
    ...defaults
  })
};

export function defaultCreateReducer<T extends AbstractEntity>(
  actions: AbstractActions<T>,
  adapter: EntityAdapter<T>,
  entityInitialState) {
  return createReducer(
    entityInitialState,
    on(actions.getAll, (state, _action) => {
      return { ...state, loading: true };
    }),
    on(actions.getAllFailure, (state, action) => {
      return { ...state, error: action.error, loading: false };
    }),
    on(actions.getAllSuccess, (state, action) => {
      return {
        ...adapter.setAll(action.result.data, state),
        loading: false,
        loaded: true,
        totalCount: action.result.totalCount,
        limit: action.result.limit,
        page: action.result.page
      };
    }),
    on(actions.getOne, (state, _action) => {
      return {
        ...state,
        selectedLoading: true,
        selectedLoaded: false,
        selected: undefined
      };
    }),
    on(actions.getOneSuccess, (state, action) => {
      return {
        ...state,
        selectedLoading: false,
        selectedLoaded: true,
        selected: action.result
      };
    }),
    on(actions.getOneFailure, (state, action) => {
      return {
        ...state,
        selectedLoading: false,
        error: action.error
      }
    })
  );
}
