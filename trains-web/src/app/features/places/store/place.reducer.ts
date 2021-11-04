import { Action, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { PlaceActions } from './place.actions';
import {PlaceDto} from "../../../models/place.model";

export interface PlacesState extends EntityState<PlaceDto> {
  loading: boolean;
  loaded: boolean;
  error: any;
  totalCount: number | undefined;
  limit: number;
  page: number;
  filter: string;
  sortColumn: string;
  sortDescending: boolean;
  selected: PlaceDto;
  selectedLoading: boolean,
  selectedLoaded: boolean,
}

export function selectPlaceId(place: PlaceDto): string {
  return place.id;
}

const adapter: EntityAdapter<PlaceDto> = createEntityAdapter<PlaceDto>({
  selectId: selectPlaceId
});
export const placesAdapter = adapter;

export const placeInitialState: PlacesState = adapter.getInitialState({
  loading: false,
  loaded: false,
  error: undefined,
  totalCount: undefined,
  limit: undefined,
  page: undefined,
  filter: undefined,
  sortColumn: undefined,
  sortDescending: undefined,
  selected: undefined,
  selectedLoading: false,
  selectedLoaded: false,
});

const placeReducer = createReducer(
  placeInitialState,
  on(PlaceActions.getAll, (state, _action) => {
    return { ...state, loading: true };
  }),
  on(PlaceActions.getAllFailure, (state, action) => {
    return { ...state, error: action.error, loading: false };
  }),
  on(PlaceActions.getAllSuccess, (state, action) => {
    return {
      ...adapter.setAll(action.result.data, state),
      loading: false,
      loaded: true,
      totalCount: action.result.totalCount,
      limit: action.result.limit,
      page: action.result.page
    };
  }),
  on(PlaceActions.getOne, (state, _action) => {
    return {
      ...state,
      selectedLoading: true,
      selectedLoaded: false,
      selected: undefined
    };
  }),
  on(PlaceActions.getOneSuccess, (state, action) => {
    return {
      ...state,
      selectedLoading: false,
      selectedLoaded: true,
      selected: action.result
    };
  }),
  on(PlaceActions.getOneFailure, (state, action) => {
    return {
      ...state,
      selectedLoading: false,
      error: action.error
    }
  })
);

export function reducer(state: PlacesState | undefined, action: Action) {
  return placeReducer(state, action);
}
