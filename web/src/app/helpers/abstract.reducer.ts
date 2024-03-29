import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ActionCreator } from '@ngrx/store/src/models';
import { ReducerTypes } from '@ngrx/store/src/reducer_creator';
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

  loading: boolean;   // a load is in progress
  loaded: boolean;    // a load has been completed

  selectedLoading: boolean,
  selectedLoaded: boolean,
}

export type IdSelectorFn = (entity: AbstractEntity) => string;
export const defaultIdSelector: IdSelectorFn = (entity: AbstractEntity): string  => entity.id;

export function createAdapter<T extends AbstractEntity>(idSelector = defaultIdSelector) {
  return createEntityAdapter<T>({
    selectId: idSelector
  });
}

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
  entityInitialState,
  ...extraReducers: ReducerTypes<AbstractEntityState<T>, readonly ActionCreator[]>[]) {
  if (!extraReducers) {
    extraReducers = [];
  }

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
        error: undefined,
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
        ...adapter.setOne(action.result, state),
        error: true,
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
    }),
    on(actions.selectOne, (state, action) => {
      return {
        ...state,
        selected: action.payload
      }
    }),
    on(actions.createSuccess, (state, action) => {
      console.log('createSuccess', action.result);
      return {
        ...adapter.addOne(action.result, state),
        limit: state.limit + 1,
      };
    }),
    on(actions.updateSuccess, (state, action) => {
      return adapter.updateOne({ id: action.result.id, changes: action.result }, state);
    }),
    on(actions.deleteSuccess, (state, action) => {
      return {
        ...adapter.removeOne(action.result, state),
        limit: state.limit - 1,
      };
    }),
    on(actions.createFailure, actions.updateFailure, actions.deleteFailure, (state, action) => ({
      ...state,
      error: action.error
    })),
    ...extraReducers
  );
}
