import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { cloneDeep, findIndex, slice } from 'lodash-es';
import {
  featureGroup,
  LatLng,
  latLng,
  Layer,
  LineUtil,
  point,
  polyline,
  tileLayer
} from 'leaflet';
import 'leaflet';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import * as uuid from 'uuid';
import { AnimatedMarker } from '../../../helpers/plugins/AnimatedMarker';
import { PlaceConnectionDto } from '../../../models/place-connection.model';
import { TrainsMarker } from '../../../models/trains-leaflet';
import { MapService } from '../../../services/map.service';
import { UiService } from '../../../services/ui.service';
import { AppState } from '../../../store';
import { PLACE_CONNECTIONS, PLACE_MAP_DEFAULT_ZOOM } from '../../../utils/constants';
import { PlaceConnectionFormComponent } from '../components/place-connection-form/place-connection-form.component';
import { PlaceConnectionActions, PlaceConnectionSelectors } from '../store';
import { PlaceDataService } from '../../places/services/place-data.service';
import { Actions, ofType } from '@ngrx/effects';

@Component({
  selector: 'trains-place-connection-create-page',
  template: `
    <div class="app-full-height-page">
      <div class="place-connections-form-page">
        <div class="place-connections-form-container">
          <div class="place-connections-actions">
            <!-- [disabled]="!form?.valid()" -->
            <button mat-button (click)="onSave()">{{ 'button.save' | translate }}</button>
            <button mat-button (click)="onCancel()">{{ 'button.cancel' | translate }}</button>
          </div>
          <trains-place-connection-form
            #placeConnectionForm
            *ngIf="placeConnection"
            [placeConnection]="placeConnection"
            class="place-connection-form"
            (valueChange)="placeConnectionChanged($event)"
          >
          </trains-place-connection-form>
        </div>
        <!--  -->
        <trains-custom-map
          class="place-connections-map"
          [options]="options"
          [layers]="markers$ | async"
          [addEnabled]="true"
          (mapChanged)="onMap($event)"
          (addClicked)="addClicked()"
        >
        </trains-custom-map>
      </div>
    </div>
  `,
  styleUrl: './place-connection-edit.page.scss',
})
export class PlaceConnectionEditPage implements OnInit, OnDestroy {
  destroy$ = new Subject();

  @ViewChild('placeConnectionForm')
  form: PlaceConnectionFormComponent;

  placeConnection: PlaceConnectionDto;

  theTileLayer = tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' });

  options = {
    layers: [this.theTileLayer],
    zoom: PLACE_MAP_DEFAULT_ZOOM,
    center: latLng(46.879966, -121.726909),
  };

  map: L.Map;
  map$ = new BehaviorSubject<L.Map>(null);
  markers$: Subject<Layer[]> = new BehaviorSubject([]);

  startCoords: LatLng;
  endCoords: LatLng;
  routeCoords: LatLng[];

  startMarker: TrainsMarker;
  endMarker: TrainsMarker;
  routeMarkers: TrainsMarker[] = [];

  routeLayer;

  constructor(
    private readonly store: Store<AppState>,
    private readonly router: Router,
    private readonly mapService: MapService,
    private readonly uiService: UiService,
    private readonly placeDataService: PlaceDataService,
    private readonly actions$: Actions,
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.store.pipe(select(PlaceConnectionSelectors.Selected)),
      this.placeDataService.placesById$(),
      this.map$,
    ])
      .pipe(
        filter(([connection, _placesMap, map]) => !!connection && !!map),
        take(1),
      )
      .subscribe(([connection, placesMap, _map]) => {
        this.placeConnection = cloneDeep(connection);

        if (this.placeConnection.id) {
          this.uiService.setPageTitle('page.placeConnection.editTitle');
        } else {
          this.uiService.setPageTitle('page.placeConnection.createTitle');
        }

        this.initMap(placesMap);
      });
  }

  setMarkers() {
    // remove markers from map
    if (this.startMarker) {
      this.startMarker.removeFrom(this.map);
    }
    if (this.endMarker) {
      this.endMarker.removeFrom(this.map);
    }
    if (this.routeMarkers) {
      this.routeMarkers.forEach((oneMarker) => oneMarker.removeFrom(this.map));
    }

    // make them again from coords
    this.startMarker = this.makeStartEndMarker(this.startCoords).addTo(this.map);
    this.endMarker = this.makeStartEndMarker(this.endCoords).addTo(this.map);
    this.routeMarkers = this.routeCoords.map((c) => this.makeMarker(c).addTo(this.map));

    const markers = [this.startMarker, ...this.routeMarkers, this.endMarker];

    this.markers$.next(markers);

    if (this.map) {
      const group = featureGroup(markers);
      this.map.fitBounds(group.getBounds(), { maxZoom: 14, padding: point(20, 20) });
    }
  }

  setRoute() {
    if (!this.placeConnection) {
      return;
    }

    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
    }
    const line = this.makePolyline();
    this.routeLayer = line.addTo(this.map);
  }

  makeMarker(aLatLong, name?: string): TrainsMarker {
    if (!name) {
      name = uuid.v4();
    }

    const aMarker = new TrainsMarker(name, aLatLong, { icon: this.mapService.iconGreen, draggable: true });
    aMarker.on('dragend', (event) => {
      const latlng = event.target.getLatLng();
      this.markerDragEnd(aMarker, latlng);
    });

    return aMarker;
  }

  makeStartEndMarker(aLatLong, name?: string): TrainsMarker {
    if (!name) {
      name = uuid.v4();
    }

    const aMarker = new TrainsMarker(name, aLatLong, { icon: this.mapService.iconBlue, draggable: false });
    aMarker.on('dragend', (event) => {
      const latlng = event.target.getLatLng();
      this.markerDragEnd(aMarker, latlng);
    });

    return aMarker;
  }

  makePolyline() {
    const line = polyline(
      [
        this.startMarker.getLatLng(),
        ...this.routeMarkers.map((marker) => marker.getLatLng()),
        this.endMarker.getLatLng(),
      ],
      { color: 'red', weight: 10, opacity: 0.4 },
    );
    line.on('click', (e) => {
      let min = undefined;
      let minIndex = undefined;
      const verts = e.target.getLatLngs();
      let i = 0;
      while (i < verts.length - 1) {
        const dist = LineUtil.pointToSegmentDistance(
          this.map.latLngToLayerPoint(e.latlng),
          this.map.latLngToLayerPoint(verts[i]),
          this.map.latLngToLayerPoint(verts[i + 1]),
        );

        if (!min || dist < min) {
          min = dist;
          minIndex = i;
        }

        i++;
      }

      if (min || min === 0) {
        const newMarker = this.makeMarker(e.latlng).addTo(this.map);

        if (minIndex === 0) {
          // insert between start and first point
          this.routeMarkers = [newMarker, ...this.routeMarkers];
          this.routeCoords = [e.latlng, ...this.routeCoords];
        } else if (minIndex === verts.length - 1) {
          // insert between last point and end
          this.routeMarkers = [...this.routeMarkers, newMarker];
          this.routeCoords = [...this.routeCoords, e.latlng];
        } else {
          // because verts contains start point, insert point in route is - 1
          const insertPoint = minIndex - 1;
          this.routeMarkers = [
            ...this.routeMarkers.slice(0, insertPoint + 1),
            newMarker,
            ...this.routeMarkers.slice(insertPoint + 1),
          ];
          this.routeCoords = [
            ...this.routeCoords.slice(0, insertPoint + 1),
            e.latlng,
            ...this.routeCoords.slice(insertPoint + 1),
          ];
        }

        this.setRoute();
      }
    });

    return line;
  }

  markerDragEnd(marker: TrainsMarker, _latlng) {
    const index = findIndex(this.routeMarkers, (mLatlng) => mLatlng.name === marker.name);

    if (index !== -1) {
      this.routeMarkers = [
        ...slice(this.routeMarkers, 0, index),
        marker,
        ...slice(this.routeMarkers, index + 1, this.routeMarkers.length),
      ];
      this.routeCoords = [
        ...slice(this.routeCoords, 0, index),
        marker.getLatLng(),
        ...slice(this.routeCoords, index + 1, this.routeCoords.length),
      ];

      this.setRoute();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  onCancel() {
    this.router.navigateByUrl(PLACE_CONNECTIONS);
  }

  onSave() {
    // put route coords back
    this.placeConnection.content.route = this.routeCoords.map((ll) => [ll.lat, ll.lng]);

    if (this.placeConnection.id) {
      this.store.dispatch(PlaceConnectionActions.update({ payload: this.placeConnection }));
    } else {
      this.store.dispatch(PlaceConnectionActions.create({ payload: this.placeConnection }));
    }

    this.actions$.pipe(ofType(
      PlaceConnectionActions.createSuccess,
      PlaceConnectionActions.createFailure,
      PlaceConnectionActions.updateSuccess,
      PlaceConnectionActions.updateFailure), take(1)).subscribe((action) => {
        console.log('PlaceConnection - save response', action);

        if(PlaceConnectionActions.isCreateSuccess(action) || PlaceConnectionActions.isUpdateSuccess(action)) {
          this.router.navigateByUrl(PLACE_CONNECTIONS);
        }
      });
  }

  placeConnectionChanged($event) {
    this.placeConnection = { ...this.placeConnection, ...$event };

    this.placeDataService
      .placesById$()
      .pipe(take(1))
      .subscribe((placesMap) => {
        this.initMap(placesMap);
      });
  }

  initMap(placesMap) {
    if (this.placeConnection.content && this.placeConnection.content.route) {
      this.routeCoords = this.placeConnection.content.route.map((point) => new LatLng(point[0], point[1]));
    } else {
      this.routeCoords = [];
    }

    const start = placesMap[this.placeConnection.startId];
    const end = placesMap[this.placeConnection.endId];

    this.startCoords = new LatLng(start.lat, start.lng);
    this.endCoords = new LatLng(end.lat, end.lng);

    setTimeout(() => {
      this.setMarkers();
      this.setRoute();
    }, 100);
  }

  onMap(map: L.Map) {
    this.map = map;
    this.map$.next(map);
  }

  addClicked() {
    const markers = [this.startMarker, ...this.routeMarkers, this.endMarker];

    let i = 0;
    let distance: number = 0;
    while (i < markers.length - 1) {
      distance += markers[i].getLatLng().distanceTo(markers[i + 1].getLatLng());
      i++;
    }

    const animatedMarker = new AnimatedMarker(
      this.map,
      'train',
      'train-icon',
      markers.map((m) => m.getLatLng()),
      {
        autoStart: false,
        icon: this.mapService.iconYellowWithClass('train-icon'),
        distance,
        interval: 10000,
        onEnd: () => {
          animatedMarker.removeFrom(this.map);
        },
      },
    ).addTo(this.map);

    animatedMarker.start();
  }
}
