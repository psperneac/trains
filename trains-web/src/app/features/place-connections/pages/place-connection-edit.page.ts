import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { cloneDeep, findIndex, isNil, slice } from 'lodash';
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
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { filter, take, withLatestFrom } from 'rxjs/operators';
import * as uuid from 'uuid';
import { PlaceConnectionDto } from '../../../models/place-connection.model';
import { TrainsMarker } from '../../../models/trains-leaflet';
import { MapService } from '../../../services/map.service';
import { UiService } from '../../../services/ui.service';
import { AppState } from '../../../store';
import { PLACE_CONNECTIONS, PLACE_MAP_DEFAULT_ZOOM } from '../../../utils/constants';
import { PlaceConnectionFormComponent } from '../components/place-connection-form/place-connection-form.component';
import { PlaceConnectionActions, PlaceConnectionSelectors } from '../store';
import { PlaceDataService } from '../../places/services/place-data.service';

@Component({
  selector: 'trains-place-connection-create-page',
  templateUrl: './place-connection-edit.page.html',
  styleUrls: ['./place-connection-edit.page.scss']
})
export class PlaceConnectionEditPage implements OnInit, OnDestroy {
  destroy$ = new Subject();

  @ViewChild('placeConnectionForm')
  form: PlaceConnectionFormComponent;

  placeConnection: PlaceConnectionDto;

  theTileLayer = tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' });

  options = {
    layers: [
      this.theTileLayer
    ],
    zoom: PLACE_MAP_DEFAULT_ZOOM,
    center: latLng(46.879966, -121.726909)
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
    private readonly placeDataService: PlaceDataService
  ) {
  }

  ngOnInit(): void {
    combineLatest([
      this.store.pipe(select(PlaceConnectionSelectors.Selected)),
      this.placeDataService.placesById$(),
      this.map$]).pipe(filter(([connection, placesMap, map]) => !!connection && !!map),
      take(1)
    ).subscribe(([connection, placesMap, map]) => {

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
      this.routeMarkers.forEach(oneMarker => oneMarker.removeFrom(this.map));
    }

    // make them again from coords
    this.startMarker = this.makeStartEndMarker(this.startCoords).addTo(this.map);
    this.endMarker = this.makeStartEndMarker(this.endCoords).addTo(this.map);
    this.routeMarkers = this.routeCoords.map(c => this.makeMarker(c).addTo(this.map));

    const markers = [
      this.startMarker,
      ...this.routeMarkers,
      this.endMarker];

    this.markers$.next(markers);

    if (this.map) {
      const group = featureGroup(markers);
      this.map.fitBounds(group.getBounds(), { maxZoom: 14, padding: point(20, 20)});
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

    const aMarker = new TrainsMarker(name, aLatLong,
      { icon: this.mapService.iconGreen, draggable: true });
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

    const aMarker = new TrainsMarker(name, aLatLong,
      { icon: this.mapService.iconBlue, draggable: false });
    aMarker.on('dragend', (event) => {
      const latlng = event.target.getLatLng();
      this.markerDragEnd(aMarker, latlng);
    });

    return aMarker;
  }

  makePolyline() {
    const line = polyline([
      this.startMarker.getLatLng(),
      ...this.routeMarkers.map(marker => marker.getLatLng()),
      this.endMarker.getLatLng()
    ], {color: 'red', weight: 10, opacity: 0.4});
    line.on('click', (e) => {
      let min = undefined;
      let minIndex = undefined;
      const verts = e.target.getLatLngs();
      let i = 0;
      while(i < verts.length -1) {
        const dist = LineUtil.pointToSegmentDistance(
          this.map.latLngToLayerPoint(e.latlng),
          this.map.latLngToLayerPoint(verts[i]),
          this.map.latLngToLayerPoint(verts[i+1]));

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
          this.routeMarkers = [...this.routeMarkers.slice(0, insertPoint + 1), newMarker, ...this.routeMarkers.slice(insertPoint + 1)];
          this.routeCoords = [...this.routeCoords.slice(0, insertPoint + 1), e.latlng, ...this.routeCoords.slice(insertPoint + 1)];
        }

        this.markers$.next([this.startMarker, ...this.routeMarkers, this.endMarker]);

        this.setRoute();
      }
    });

    return line;
  }

  markerDragEnd(marker: TrainsMarker, latlng) {
    const index = findIndex(this.routeMarkers,
      (mLatlng) => mLatlng.name === marker.name);

    if(index !== -1) {
      this.routeMarkers = [
        ...slice(this.routeMarkers, 0, index),
        marker,
        ...slice(this.routeMarkers, index+1, this.routeMarkers.length)];
      this.routeCoords = [
        ...slice(this.routeCoords, 0, index),
        marker.getLatLng(),
        ...slice(this.routeCoords, index+1, this.routeCoords.length)];

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
    this.placeConnection.content.route = this.routeCoords.map(ll => ([ll.lat, ll.lng]));

    if (this.placeConnection.id) {
      this.store.dispatch(PlaceConnectionActions.update({ payload: this.placeConnection }));
    } else {
      this.store.dispatch(PlaceConnectionActions.create({ payload: this.placeConnection }));
    }
  }

  placeConnectionChanged($event) {
    this.placeConnection = { ...this.placeConnection, ...$event };

    this.placeDataService.placesById$().pipe(take(1)).subscribe(placesMap => {
      this.initMap(placesMap);
    })
  }

  initMap(placesMap) {
    if (this.placeConnection.content && this.placeConnection.content.route) {
      this.routeCoords = this.placeConnection.content.route.map(point => new LatLng(point[0], point[1]));
    }

    const start = placesMap[this.placeConnection.startId];
    const end = placesMap[this.placeConnection.endId];

    this.startCoords = new LatLng(start.lat, start.long);
    this.endCoords = new LatLng(end.lat, end.long);

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
    this.placeDataService.placesById$().pipe(take(1)).subscribe(placesMap => {
      if (!this.placeConnection) {
        return;
      }
      const start = placesMap[this.placeConnection.startId];
      const end = placesMap[this.placeConnection.endId];

      const center = this.map.getBounds().getCenter();
      const centerMarker = this.makeMarker([center.lat, center.lng]);
      centerMarker.addTo(this.map);
      this.routeMarkers = [...this.routeMarkers, centerMarker];

      if (this.routeLayer) {
        this.map.removeLayer(this.routeLayer);
      }
      const line = this.makePolyline();
      this.routeLayer = line.addTo(this.map);
    });
  }
}
