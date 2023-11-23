import { Action } from '@ngrx/store';
import { AbstractEntityState, createAdapter, createInitialState, defaultCreateReducer } from '../../../helpers/abstract.reducer';
import { MapTemplateDto } from '../../../models/map-template.model';
import { MapTemplateActions } from './map-template.actions';

export interface MapTemplateState extends AbstractEntityState<MapTemplateDto> {
}

export const mapTemplateAdapter = createAdapter<MapTemplateDto>();
const mapTemplateInitialState = createInitialState(mapTemplateAdapter);
const mapTemplateReducer = defaultCreateReducer(
  MapTemplateActions,
  mapTemplateAdapter,
  mapTemplateInitialState);

export function reducer(state: MapTemplateState | undefined, action: Action) {
  return mapTemplateReducer(state, action);
}
