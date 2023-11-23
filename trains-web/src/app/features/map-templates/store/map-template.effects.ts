import { Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AbstractEffects } from '../../../helpers/abstract.effects';
import { MapTemplateDto } from '../../../models/map-template.model';
import { AppState } from '../../../store';
import { MapTemplateService } from '../services/map-template.service';
import { MapTemplateActions } from './map-template.actions';
import { Injectable } from '@angular/core';
import { MapTemplateState } from './map-template.reducer';

@Injectable()
export class MapTemplateEffects extends AbstractEffects<MapTemplateState, MapTemplateDto> {
  constructor(
    readonly actions$: Actions,
    readonly service: MapTemplateService,
    readonly store: Store<AppState>,
    readonly router: Router
  ) {
    super(actions$, service, store, router, MapTemplateActions, MapTemplateSelectors);
  }
}
