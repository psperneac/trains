import { createReducer, on } from '@ngrx/store';
import { PlaceTypeDto } from '../../services/place-type.service';
import { PlaceTypeActions } from './place-type.actions';

export interface PlaceTypeState {
  placeTypes: PlaceTypeDto[];
  allPlaceTypes: PlaceTypeDto[];
  selectedPlaceType: PlaceTypeDto | null;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalCount: number;
}

export const initialPlaceTypeState: PlaceTypeState = {
  placeTypes: [],
  allPlaceTypes: [],
  selectedPlaceType: null,
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  totalCount: 0,
};

export const placeTypeReducer = createReducer(
  initialPlaceTypeState,

  on(PlaceTypeActions.loadPlaceTypes, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(PlaceTypeActions.loadPlaceTypesSuccess, (state, { placeTypes, page, limit, totalCount }) => ({
    ...state,
    placeTypes,
    page,
    limit,
    totalCount,
    loading: false,
    error: null,
  })),

  on(PlaceTypeActions.loadPlaceTypesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(PlaceTypeActions.loadAllPlaceTypes, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(PlaceTypeActions.loadAllPlaceTypesSuccess, (state, { placeTypes }) => ({
    ...state,
    allPlaceTypes: placeTypes,
    loading: false,
    error: null,
  })),

  on(PlaceTypeActions.loadAllPlaceTypesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(PlaceTypeActions.loadPlaceType, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(PlaceTypeActions.loadPlaceTypeSuccess, (state, { placeType }) => ({
    ...state,
    selectedPlaceType: placeType,
    loading: false,
    error: null,
  })),

  on(PlaceTypeActions.loadPlaceTypeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(PlaceTypeActions.addPlaceType, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(PlaceTypeActions.addPlaceTypeSuccess, (state, { placeType }) => ({
    ...state,
    loading: false,
    error: null,
  })),

  on(PlaceTypeActions.addPlaceTypeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(PlaceTypeActions.updatePlaceType, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(PlaceTypeActions.updatePlaceTypeSuccess, (state, { placeType }) => ({
    ...state,
    loading: false,
    error: null,
  })),

  on(PlaceTypeActions.updatePlaceTypeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(PlaceTypeActions.deletePlaceType, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(PlaceTypeActions.deletePlaceTypeSuccess, (state, { id }) => ({
    ...state,
    placeTypes: state.placeTypes.filter((pt) => pt.id !== id),
    allPlaceTypes: state.allPlaceTypes.filter((pt) => pt.id !== id),
    loading: false,
    error: null,
  })),

  on(PlaceTypeActions.deletePlaceTypeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(PlaceTypeActions.clearPlaceTypeError, (state) => ({
    ...state,
    error: null,
  })),

  on(PlaceTypeActions.setSelectedPlaceType, (state, { placeType }) => ({
    ...state,
    selectedPlaceType: placeType,
  }))
);