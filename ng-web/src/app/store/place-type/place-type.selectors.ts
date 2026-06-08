import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PlaceTypeState } from './place-type.state';

export const selectPlaceTypeState = createFeatureSelector<PlaceTypeState>('placeType');

export const selectPlaceTypes = createSelector(selectPlaceTypeState, (state) => state.placeTypes);

export const selectAllPlaceTypes = createSelector(selectPlaceTypeState, (state) => state.allPlaceTypes);

export const selectSelectedPlaceType = createSelector(selectPlaceTypeState, (state) => state.selectedPlaceType);

export const selectPlaceTypeLoading = createSelector(selectPlaceTypeState, (state) => state.loading);

export const selectPlaceTypeError = createSelector(selectPlaceTypeState, (state) => state.error);

export const selectPlaceTypePage = createSelector(selectPlaceTypeState, (state) => state.page);

export const selectPlaceTypeLimit = createSelector(selectPlaceTypeState, (state) => state.limit);

export const selectPlaceTypeTotalCount = createSelector(selectPlaceTypeState, (state) => state.totalCount);

export const selectHasMorePlaceTypes = createSelector(
  selectPlaceTypeState,
  (state) => state.page * state.limit < state.totalCount
);