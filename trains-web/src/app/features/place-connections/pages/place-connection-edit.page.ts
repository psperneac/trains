import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { cloneDeep, findIndex, isNil, slice } from 'lodash';
import { featureGroup, FeatureGroup, icon, latLng, Layer, marker, point, polyline, tileLayer } from 'leaflet';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { PlaceConnectionDto } from '../../../models/place-connection.model';
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
    // zoom: PLACE_MAP_DEFAULT_ZOOM,
    center: latLng(46.879966, -121.726909)
  };

  map: L.Map;
  markers$: Subject<Layer[]> = new BehaviorSubject([]);

  addedMarkers = [];

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
    this.store.pipe(
      select(PlaceConnectionSelectors.Selected),
      filter(connection => !isNil(connection)),
      take(1)
    ).subscribe(connection => {
      this.placeConnection = cloneDeep(connection);

      if (this.placeConnection.content && this.placeConnection.content.route) {
        this.addedMarkers = this.placeConnection.content.route;
      }

      // this.setMarkers();
      // this.setRoute();

      if (this.placeConnection.id) {
        this.uiService.setPageTitle('page.placeConnection.editTitle');
      } else {
        this.uiService.setPageTitle('page.placeConnection.createTitle');
      }
    });
  }

  setMarkers() {
    this.placeDataService.placesById$().pipe(take(1)).subscribe(placesMap => {
      if (!this.placeConnection) {
        return;
      }
      const start = placesMap[this.placeConnection.startId];
      const end = placesMap[this.placeConnection.endId];

      const startMarker = marker([start.lat, start.long],
        { icon: this.mapService.iconRed, opacity: 0.4 });
      const endMarker = marker([end.lat, end.long],
        { icon: this.mapService.iconBlue, opacity: 0.4 });

      const markers = [startMarker, endMarker, ...this.addedMarkers];

      console.log('set marker', markers);

      this.markers$.next(markers);
      if (this.map) {
        const group = featureGroup([startMarker, endMarker]);
        this.map.fitBounds(group.getBounds(), { maxZoom: 14, padding: point(20, 20)});
      }
    });
  }

  setRoute() {
    this.placeDataService.placesById$().pipe(take(1)).subscribe(placesMap => {
      if (!this.placeConnection) {
        return;
      }

      const start = placesMap[this.placeConnection.startId];
      const end = placesMap[this.placeConnection.endId];

      if (this.routeLayer) {
        this.map.removeLayer(this.routeLayer);
      }
      this.routeLayer = polyline([[start.lat, start.long], ...this.addedMarkers, [end.lat, end.long]], {color: 'red'}).addTo(this.map);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  onCancel() {
    this.router.navigateByUrl(PLACE_CONNECTIONS);
  }

  onSave() {
    console.log('Save', this.placeConnection);
    if (this.placeConnection.id) {
      this.store.dispatch(PlaceConnectionActions.update({ payload: this.placeConnection }));
    } else {
      this.store.dispatch(PlaceConnectionActions.create({ payload: this.placeConnection }));
    }
  }

  placeConnectionChanged($event) {
    console.log('Got update', $event);
    this.placeConnection = { ...this.placeConnection, ...$event };
    this.setMarkers();
  }

  onMap(map: L.Map) {
    this.map = map;

    setTimeout(() => {
      this.setMarkers();
      this.setRoute();
    }, 100);
  }

  addClicked() {
    this.placeDataService.placesById$().pipe(take(1)).subscribe(placesMap => {
      if (!this.placeConnection) {
        return;
      }
      const start = placesMap[this.placeConnection.startId];
      const end = placesMap[this.placeConnection.endId];

      const center = this.map.getBounds().getCenter();
      this.addedMarkers = [...this.addedMarkers, [center.lat, center.lng]];
      console.log('Added markers', this.addedMarkers);

      const startMarker = marker([start.lat, start.long],
        { icon: this.mapService.iconRed, opacity: 0.4 });
      const endMarker = marker([end.lat, end.long],
        { icon: this.mapService.iconBlue, opacity: 0.4 });

      const markers = [startMarker, endMarker, ...this.addedMarkers.map(
        aLatLong => {
          const aMarker = marker(aLatLong,
            { icon: this.mapService.iconGreen, draggable: true });
          let original_latlng = [aLatLong[0], aLatLong[1]];

          aMarker.on('dragend', (event) => {
            const latlng = event.target.getLatLng();

            const index = findIndex(this.addedMarkers,
              (mLatlng) => mLatlng[0] === original_latlng[0] && mLatlng[1] === original_latlng[1]);
            if(index !== -1) {
              this.addedMarkers = [...slice(this.addedMarkers, 0, index), [latlng.lat, latlng.lng] ,...slice(this.addedMarkers, index+1, this.addedMarkers.length)];
              original_latlng = [latlng.lat, latlng.lng];
              if (this.routeLayer) {
                this.map.removeLayer(this.routeLayer);
              }
              this.routeLayer = polyline([[start.lat, start.long], ...this.addedMarkers, [end.lat, end.long]], {color: 'red'}).addTo(this.map);
            }

            console.log(latlng.lat, latlng.lng)
          });

          return aMarker;
        })];
      this.markers$.next(markers);

      if (this.routeLayer) {
        this.map.removeLayer(this.routeLayer);
      }
      this.routeLayer = polyline([[start.lat, start.long], ...this.addedMarkers, [end.lat, end.long]], {color: 'red'}).addTo(this.map);
    });
  }
}
