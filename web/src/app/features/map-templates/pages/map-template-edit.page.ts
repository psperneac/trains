import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { cloneDeep, isNil } from 'lodash-es';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { MapTemplateDto } from '../../../models/map-template.model';
import { UiService } from '../../../services/ui.service';
import { AppState } from '../../../store';
import { MAP_TEMPLATES, MAP_TEMPLATE_MAP_DEFAULT_ZOOM } from '../../../utils/constants';
import { MapTemplateFormComponent } from '../components/map-template-form.component';
import { Actions, ofType } from '@ngrx/effects';
import { MapTemplateActions, MapTemplateSelectors } from '../store/map-template.store';
import { Layer, latLng, tileLayer } from 'leaflet';

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
                             class="map-templates-form"
                             (valueChange)="mapChanged($event)"></trains-map-template-form>
        </div>
        <trains-custom-map
          class="map-templates-map"
          [options]="options"
          [layers]="markers$ | async"
          (mapChanged)="onMap($event)"
        >
        </trains-custom-map>
      </div>
    </div>
  `,
  styleUrl: './map-template-edit.page.scss',
})
export class MapTemplateEditPage implements OnInit, OnDestroy {
  destroy$ = new Subject();

  map: MapTemplateDto;

  @ViewChild('mapTemplateForm')
  form: MapTemplateFormComponent;

  theTileLayer = tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' });

  options = {
    layers: [this.theTileLayer],
    zoom: MAP_TEMPLATE_MAP_DEFAULT_ZOOM,
    center: latLng(46.879966, -121.726909),
  };

  lMap: L.Map;
  map$ = new BehaviorSubject<L.Map>(null);
  markers$: Subject<Layer[]> = new BehaviorSubject([]);

  constructor(
    private store: Store<AppState>,
    private readonly router: Router,
    private readonly uiService: UiService,
    readonly actions$: Actions,
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


  onMap(map: L.Map) {
    this.lMap = map;
    this.map$.next(map);
  }

  async onCancel() {
    await this.router.navigateByUrl(MAP_TEMPLATES);
  }

  onSave() {
    if (this.map.id) {
      this.store.dispatch(MapTemplateActions.update({payload: this.map}));
    } else {
      this.store.dispatch(MapTemplateActions.create({payload: this.map}));
    }

    this.actions$.pipe(ofType(
      MapTemplateActions.createSuccess,
      MapTemplateActions.createFailure,
      MapTemplateActions.updateSuccess,
      MapTemplateActions.updateFailure), take(1)).subscribe((action) => {
        console.log('MapTemplate - save response', action);

        if(MapTemplateActions.isCreateSuccess(action) || MapTemplateActions.isUpdateSuccess(action)) {
          this.router.navigateByUrl(MAP_TEMPLATES);
        }
      });
  }

  mapChanged(map: MapTemplateDto) {
    this.map = { ...this.map, ...map };
  }
}
