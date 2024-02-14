import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { cloneDeep, isNil, uniqBy } from 'lodash-es';
import { BehaviorSubject, combineLatest, Subject, tap } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { MapTemplateDto } from '../../../models/map-template.model';
import { PlaceDto } from '../../../models/place.model';
import { UiService } from '../../../services/ui.service';
import { AppState } from '../../../store';
import { MAP_TEMPLATES, MAP_TEMPLATE_MAP_DEFAULT_ZOOM } from '../../../utils/constants';
import { PlaceDataService } from '../../places/services/place-data.service';
import { MapTemplateFormComponent } from '../components/map-template-form.component';
import { Actions, ofType } from '@ngrx/effects';
import { MapPlaceDataService } from '../services/map-place-data.service';
import { MapPlaceActions } from '../store/map-place.store';
import { MapTemplateActions, MapTemplateSelectors } from '../store/map-template.store';
import { Layer, latLng, tileLayer } from 'leaflet';
import { MatDialog } from '@angular/material/dialog';
import { SelectPlaceComponent } from '../../../components/select-place/select-place.component';

@Component({
  selector: 'trains-map-template-create-page',
  templateUrl: './map-template-edit.page.html',
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

  mapTemplate$ = this.store.pipe(select(MapTemplateSelectors.Selected));
  allPlaces$ = this.placeDataService.places$;
  mapPlaces$ = this.mapTemplate$.pipe(
    tap(mapTemplate => console.log('mapTemplate', mapTemplate)),
    filter(mapTemplate => !isNil(mapTemplate)),
    switchMap(mapTemplate =>
      this.mapPlaceDataService.mapPlacesByMapId$(mapTemplate.id)),
    tap(mapPlaces => console.log('mapPlaces', mapPlaces))
  );
  toAddPlaces$ = new BehaviorSubject<PlaceDto[]>([]);

  availablePlaces$ = combineLatest([this.allPlaces$, this.mapPlaces$, this.toAddPlaces$]).pipe(
    tap(([allPlaces, mapPlaces, toAddPlaces]) => console.log('allPlaces', allPlaces, 'mapPlaces', mapPlaces, 'toAddPlaces', toAddPlaces)),
    filter(([allPlaces, mapPlaces, toAddPlaces]) => !isNil(allPlaces) && !isNil(mapPlaces) && !isNil(toAddPlaces)),
    map(([allPlaces, mapPlaces, toAddPlaces]) => {
      const mapPlaceIds = mapPlaces.map(mp => mp.placeId);
      const toAddPlacesIds = toAddPlaces.map(p => p.id);
      const ret = allPlaces.filter(p => !mapPlaceIds.includes(p.id) && !toAddPlacesIds.includes(p.id));
      return ret;
    }),
    tap(places => console.log('availablePlaces', places))
  );

  constructor(
    private store: Store<AppState>,
    private readonly router: Router,
    private readonly uiService: UiService,
    readonly actions$: Actions,
    public dialog: MatDialog,
    private readonly placeDataService: PlaceDataService,
    private readonly mapPlaceDataService: MapPlaceDataService,
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

    this.toAddPlaces$.pipe(take(1)).subscribe(toAddPlaces => {
      toAddPlaces.forEach(place => {
        const payload = {payload: {id: undefined, mapId: this.map.id, placeId: place.id}};
        console.log('MapPlace - create', payload);
        this.store.dispatch(MapPlaceActions.create(payload));
      });
    });

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

  addConnectionClicked($event) {
    console.log('addConnectionClicked', $event);
  }

  addPlaceClicked($event) {
    console.log('addPlaceClicked', $event);

    let dialogRef = this.dialog.open(SelectPlaceComponent, {
      data: { places$: this.availablePlaces$ },
      // height: '400px',
      // width: '600px',
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      const placeToAdd = result.value;
      if (placeToAdd) {
        this.toAddPlaces$.next(uniqBy([...this.toAddPlaces$.getValue(), placeToAdd], 'id'));
      }
    });
  }
}
