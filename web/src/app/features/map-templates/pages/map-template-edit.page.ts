import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { cloneDeep, isNil } from 'lodash';
import { Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { MapTemplateDto } from '../../../models/map-template.model';
import { UiService } from '../../../services/ui.service';
import { AppState } from '../../../store';
import { MAP_TEMPLATES } from '../../../utils/constants';
import { MapTemplateFormComponent } from '../components/map-template-form.component';
import { MapTemplateActions, MapTemplateSelectors } from '../store';

@Component({
  selector: 'trains-map-template-create-page',
  template: `
    <div class="app-full-height-page">
      <div class="map-templates-form-page">
        <div class="map-templates-form-container">
          <div class="map-templates-actions">
            <button mat-button (click)="onSave()" [disabled]="!form?.valid()">{{'button.save' | translate}}</button>
            <button mat-button (click)="onCancel()">{{'button.cancel' | translate}}</button>
          </div>
          <trains-map-template-form #mapTemplateForm *ngIf="map" [map]="map"
                             class="place-form"
                             (valueChange)="mapChanged($event)"></trains-map-template-form>
        </div>
      </div>
    </div>
  `,
})
export class MapTemplateEditPage implements OnInit, OnDestroy {
  destroy$ = new Subject();

  map: MapTemplateDto;

  @ViewChild('mapTemplateForm')
  form: MapTemplateFormComponent;

  constructor(
    private store: Store<AppState>,
    private readonly router: Router,
    private readonly uiService: UiService
  ) {}

  ngOnInit(): void {
    this.store.pipe(
      select(MapTemplateSelectors.Selected),
      filter(map => !isNil(map)),
      take(1)
    ).subscribe(map => {
      this.map = cloneDeep(map);
      if (this.map.id) {
        this.uiService.setPageTitle('page.mapTemplate.editTitle');
      } else {
        this.uiService.setPageTitle('page.mapTemplate.createTitle');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  onCancel() {
    this.router.navigateByUrl(MAP_TEMPLATES);
  }

  onSave() {
    if (this.map.id) {
      this.store.dispatch(MapTemplateActions.update({payload: this.map}));
    } else {
      this.store.dispatch(MapTemplateActions.create({payload: this.map}));
    }
  }

  mapChanged(map: MapTemplateDto) {
    this.map = { ...this.map, ...map };
  }
}
