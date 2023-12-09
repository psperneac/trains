import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import { MapTemplateDto } from '../../../models/map-template.model';
import { MapTemplateState, mapTemplateAdapter } from './map-template.reducer';

const selectors = mapTemplateAdapter.getSelectors();
const featureState = (state) => state['map-templates'] as MapTemplateState;

export class MapTemplateSelectorsType extends AbstractSelectors<MapTemplateState, MapTemplateDto> {
  constructor() {
    super(featureState, selectors);
  }
}

export const MapTemplateSelectors = new MapTemplateSelectorsType();
