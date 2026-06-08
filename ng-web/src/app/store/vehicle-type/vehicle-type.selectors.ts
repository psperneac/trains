import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VehicleTypeState } from './vehicle-type.state';

export const selectVehicleTypeState = createFeatureSelector<VehicleTypeState>('vehicleType');

export const selectVehicleTypes = createSelector(selectVehicleTypeState, (state) => state.vehicleTypes);

export const selectAllVehicleTypes = createSelector(selectVehicleTypeState, (state) => state.allVehicleTypes);

export const selectSelectedVehicleType = createSelector(selectVehicleTypeState, (state) => state.selectedVehicleType);

export const selectVehicleTypeLoading = createSelector(selectVehicleTypeState, (state) => state.loading);

export const selectVehicleTypeError = createSelector(selectVehicleTypeState, (state) => state.error);

export const selectVehicleTypePage = createSelector(selectVehicleTypeState, (state) => state.page);

export const selectVehicleTypeLimit = createSelector(selectVehicleTypeState, (state) => state.limit);

export const selectVehicleTypeTotalCount = createSelector(selectVehicleTypeState, (state) => state.totalCount);

export const selectHasMoreVehicleTypes = createSelector(
  selectVehicleTypeState,
  (state) => state.page * state.limit < state.totalCount
);