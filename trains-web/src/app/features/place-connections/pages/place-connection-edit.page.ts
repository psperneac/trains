import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { cloneDeep, findIndex, isNil, slice } from 'lodash';
import { featureGroup, FeatureGroup, icon, latLng, Layer, marker, point, polyline, tileLayer } from 'leaflet';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { PlaceConnectionDto } from '../../../models/place-connection.model';
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

  iconBlue = icon({
    iconUrl: 'icons/circle-blue-64.png',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  iconRed = icon({
    iconUrl: 'icons/circle-red-64.png',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  iconGreen = icon({
    iconUrl: 'icons/circle-green-64.png',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  addedMarkers = [];

  routeLayer;

  constructor(
    private readonly store: Store<AppState>,
    private readonly router: Router,
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

      const startMarker = marker([start.lat, start.long], { icon: this.iconRed, opacity: 0.4 });
      const endMarker = marker([end.lat, end.long], { icon: this.iconBlue, opacity: 0.4 });

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

      const startMarker = marker([start.lat, start.long], { icon: this.iconRed, opacity: 0.4 });
      const endMarker = marker([end.lat, end.long], { icon: this.iconBlue, opacity: 0.4 });

      const markers = [startMarker, endMarker, ...this.addedMarkers.map(
        aLatLong => {
          const aMarker = marker(aLatLong, { icon: this.iconGreen, draggable: true });
          let original_latlng = [aLatLong[0], aLatLong[1]];

          aMarker.on('dragend', (event) => {
            const latlng = event.target.getLatLng();

            const index = findIndex(this.addedMarkers, (mLatlng) => mLatlng[0] === original_latlng[0] && mLatlng[1] === original_latlng[1]);
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

/*
AR->TM
[
    [
        46.18464719915761,
        21.330121370007493
    ],
    [
        46.17698022355538,
        21.346176840781297
    ],
    [
        46.172580822606655,
        21.34918188058229
    ],
    [
        46.168537819541406,
        21.346520273901398
    ],
    [
        46.16318632910119,
        21.338964745258867
    ],
    [
        46.16128345148573,
        21.33741929621836
    ],
    [
        46.1590236988352,
        21.33707586309826
    ],
    [
        46.152124932450526,
        21.33802030417856
    ],
    [
        46.147664079779915,
        21.336818343441262
    ],
    [
        46.08222284637536,
        21.302746236496624
    ],
    [
        46.048452889103935,
        21.255281175980254
    ],
    [
        46.0466056367718,
        21.251074120258863
    ],
    [
        46.04654604695839,
        21.24660948969737
    ],
    [
        46.04624809692703,
        21.23785194513448
    ],
    [
        46.044700858010856,
        21.23374360535635
    ],
    [
        46.037728173214774,
        21.223440611752913
    ],
    [
        46.02693963659061,
        21.21322347642953
    ],
    [
        46.01371638200777,
        21.194776500379557
    ],
    [
        46.010615782063695,
        21.191685602298513
    ],
    [
        46.00530858264834,
        21.18945328701777
    ],
    [
        45.974417186594415,
        21.193144724002615
    ],
    [
        45.97000162470182,
        21.19280137365718
    ],
    [
        45.855642905426606,
        21.149023914899924
    ],
    [
        45.8431522963884,
        21.148768768116422
    ],
    [
        45.7519536311173,
        21.182416715689595
    ],
    [
        45.7497969429787,
        21.185078322370494
    ],
    [
        45.752567010682114,
        21.17120803002573
    ]
]

TM->AR

[
    [
        45.752567010682114,
        21.17120803002573
    ],
    [
        45.7497969429787,
        21.185078322370494
    ],
    [
        45.7519536311173,
        21.182416715689595
    ],
    [
        45.8431522963884,
        21.148768768116422
    ],
    [
        45.855642905426606,
        21.149023914899924
    ],
    [
        45.97000162470182,
        21.19280137365718
    ],
    [
        45.974417186594415,
        21.193144724002615
    ],
    [
        46.00530858264834,
        21.18945328701777
    ],
    [
        46.010615782063695,
        21.191685602298513
    ],
    [
        46.01371638200777,
        21.194776500379557
    ],
    [
        46.02693963659061,
        21.21322347642953
    ],
    [
        46.037728173214774,
        21.223440611752913
    ],
    [
        46.044700858010856,
        21.23374360535635
    ],
    [
        46.04624809692703,
        21.23785194513448
    ],
    [
        46.04654604695839,
        21.24660948969737
    ],
    [
        46.0466056367718,
        21.251074120258863
    ],
    [
        46.048452889103935,
        21.255281175980254
    ],
    [
        46.08222284637536,
        21.302746236496624
    ],
    [
        46.147664079779915,
        21.336818343441262
    ],
    [
        46.152124932450526,
        21.33802030417856
    ],
    [
        46.1590236988352,
        21.33707586309826
    ],
    [
        46.16128345148573,
        21.33741929621836
    ],
    [
        46.16318632910119,
        21.338964745258867
    ],
    [
        46.168537819541406,
        21.346520273901398
    ],
    [
        46.172580822606655,
        21.34918188058229
    ],
    [
        46.17698022355538,
        21.346176840781297
    ],
    [
        46.18464719915761,
        21.330121370007493
    ]
]

*/
