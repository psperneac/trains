import { createAction, on, props } from '@ngrx/store';
import { ActionCreator } from '@ngrx/store/src/models';
import { AbstractActions, ActionCreatorFn } from '../../../helpers/abstract.actions';
import { AbstractEntityState, createAdapter, defaultCreateReducer } from '../../../helpers/abstract.reducer';
import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import { MapVehicleInstanceJobDto } from '../../../models/map-vehicle-instance-job.model';
import {
  ByPlayerAndMapRequestType,
  ByPlayerAndMapResponseType,
  ByVehicleRequestType,
  ByVehicleResponseType,
  ErrorType
} from '../../../store';

class MapVehicleInstanceJobActionsType extends AbstractActions<MapVehicleInstanceJobDto> {
  getAllByPlayerAndMap: ActionCreator<string, ActionCreatorFn<ByPlayerAndMapRequestType>>;
  getAllByPlayerAndMapSuccess: ActionCreator<string, ActionCreatorFn<ByPlayerAndMapResponseType<MapVehicleInstanceJobDto>>>;
  getAllByPlayerAndMapFailure: ActionCreator<string, ActionCreatorFn<ErrorType>>;

  getAllByVehicle: ActionCreator<string, ActionCreatorFn<ByVehicleRequestType>>;
  getAllByVehicleSuccess: ActionCreator<string, ActionCreatorFn<ByVehicleResponseType<MapVehicleInstanceJobDto>>>;
  getAllByVehicleFailure: ActionCreator<string, ActionCreatorFn<ErrorType>>;

  constructor() {
    super('MapVehicleInstanceJob');


    this.getAllByPlayerAndMap = createAction(`[MapVehicleInstanceJob] Get All By Map`,
      props<ByPlayerAndMapRequestType>());
    this.getAllByPlayerAndMapSuccess = createAction(`[MapVehicleInstanceJob] Get All By Map Success`,
      props<ByPlayerAndMapResponseType<MapVehicleInstanceJobDto>>());
    this.getAllByPlayerAndMapFailure = createAction(`[MapVehicleInstanceJob] Get All By Map Failure`,
      props<ErrorType>());

    this.getAllByVehicle = createAction(`[MapVehicleInstanceJob] Get All By Vehicle`,
      props<ByVehicleRequestType>());
    this.getAllByVehicleSuccess = createAction(`[MapVehicleInstanceJob] Get All By Vehicle Success`,
      props<ByVehicleResponseType<MapVehicleInstanceJobDto>>());
    this.getAllByVehicleFailure = createAction(`[MapVehicleInstanceJob] Get All By Vehicle Failure`,
      props<ErrorType>());
  }
}

export const MapVehicleInstanceJobActions = new MapVehicleInstanceJobActionsType();

export interface MapVehicleInstanceJobsState extends AbstractEntityState<MapVehicleInstanceJobDto> {
}

export const mapVehicleInstanceJobAdapter = createAdapter<MapVehicleInstanceJobDto>();
const mapVehicleInstanceJobInitialState = mapVehicleInstanceJobAdapter.getInitialState();

const reducer = defaultCreateReducer(MapVehicleInstanceJobActions, mapVehicleInstanceJobAdapter, mapVehicleInstanceJobInitialState,
  on(MapVehicleInstanceJobActions.getAllByPlayerAndMap,
  state => ({ ...state, loading: true })),
  on(MapVehicleInstanceJobActions.getAllByPlayerAndMapSuccess,
    (state, action) => mapVehicleInstanceJobAdapter.setAll(action.result.data, { ...state, loading: false })),
  on(MapVehicleInstanceJobActions.getAllByPlayerAndMapFailure,
    (state, action) => ({ ...state, loading: false, error: action.error })),

  on(MapVehicleInstanceJobActions.getAllByVehicle,
    state => ({ ...state, loading: true })),
  on(MapVehicleInstanceJobActions.getAllByVehicleSuccess,
    (state, action) => mapVehicleInstanceJobAdapter.setAll(action.result.data, { ...state, loading: false })),
  on(MapVehicleInstanceJobActions.getAllByVehicleFailure,
    (state, action) => ({ ...state, loading: false, error: action.error }))
);

export function mapVehicleInstanceJobReducer(state: MapVehicleInstanceJobsState | undefined, action: any) {
  return reducer(state, action);
}

const selectors = mapVehicleInstanceJobAdapter.getSelectors();
const featureSelector = (state: any) => state['map-vehicle-instance-jobs'] as MapVehicleInstanceJobsState;

class MapVehicleInstanceJobSelectorsType extends AbstractSelectors<MapVehicleInstanceJobsState, MapVehicleInstanceJobDto> {
  constructor() {
    super(featureSelector, selectors);
  }


}
