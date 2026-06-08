import { createReducer, on } from '@ngrx/store';
import { VehicleTypeDto } from '../../services/vehicle-type.service';
import { VehicleTypeActions } from './vehicle-type.actions';

export interface VehicleTypeState {
  vehicleTypes: VehicleTypeDto[];
  allVehicleTypes: VehicleTypeDto[];
  selectedVehicleType: VehicleTypeDto | null;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalCount: number;
}

export const initialVehicleTypeState: VehicleTypeState = {
  vehicleTypes: [],
  allVehicleTypes: [],
  selectedVehicleType: null,
  loading: false,
  error: null,
  page: 1,
  limit: 0,
  totalCount: 0,
};

export const vehicleTypeReducer = createReducer(
  initialVehicleTypeState,

  on(VehicleTypeActions.loadVehicleTypes, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(VehicleTypeActions.loadVehicleTypesSuccess, (state, { vehicleTypes, page, limit, totalCount }) => ({
    ...state,
    vehicleTypes,
    page,
    limit,
    totalCount,
    loading: false,
    error: null,
  })),

  on(VehicleTypeActions.loadVehicleTypesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(VehicleTypeActions.loadAllVehicleTypes, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(VehicleTypeActions.loadAllVehicleTypesSuccess, (state, { vehicleTypes }) => ({
    ...state,
    allVehicleTypes: vehicleTypes,
    loading: false,
    error: null,
  })),

  on(VehicleTypeActions.loadAllVehicleTypesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(VehicleTypeActions.loadVehicleType, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(VehicleTypeActions.loadVehicleTypeSuccess, (state, { vehicleType }) => ({
    ...state,
    selectedVehicleType: vehicleType,
    loading: false,
    error: null,
  })),

  on(VehicleTypeActions.loadVehicleTypeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(VehicleTypeActions.addVehicleType, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(VehicleTypeActions.addVehicleTypeSuccess, (state, { vehicleType }) => ({
    ...state,
    loading: false,
    error: null,
  })),

  on(VehicleTypeActions.addVehicleTypeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(VehicleTypeActions.updateVehicleType, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(VehicleTypeActions.updateVehicleTypeSuccess, (state, { vehicleType }) => ({
    ...state,
    loading: false,
    error: null,
  })),

  on(VehicleTypeActions.updateVehicleTypeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(VehicleTypeActions.deleteVehicleType, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(VehicleTypeActions.deleteVehicleTypeSuccess, (state, { id }) => ({
    ...state,
    vehicleTypes: state.vehicleTypes.filter((vt) => vt.id !== id),
    allVehicleTypes: state.allVehicleTypes.filter((vt) => vt.id !== id),
    loading: false,
    error: null,
  })),

  on(VehicleTypeActions.deleteVehicleTypeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(VehicleTypeActions.clearVehicleTypeError, (state) => ({
    ...state,
    error: null,
  })),

  on(VehicleTypeActions.setSelectedVehicleType, (state, { vehicleType }) => ({
    ...state,
    selectedVehicleType: vehicleType,
  }))
);