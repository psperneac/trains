import { AbstractActions } from '../../../helpers/abstract.actions';
import { MapTemplateDto } from '../../../models/map-template.model';

export class MapTemplateActionsType extends AbstractActions<MapTemplateDto> {
  constructor() {
    super('MapTemplate');
  }
}

export const MapTemplateActions = new MapTemplateActionsType();
