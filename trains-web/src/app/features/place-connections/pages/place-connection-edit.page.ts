import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { cloneDeep, isNil } from 'lodash';
import { featureGroup, FeatureGroup, latLng, Layer, marker, point, tileLayer } from 'leaflet';
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

  options = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    // zoom: PLACE_MAP_DEFAULT_ZOOM,
    center: latLng(46.879966, -121.726909)
  };

  map: L.Map;
  markers$: Subject<Layer[]> = new BehaviorSubject([]);

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

      console.log('onInit - setting placeConnection');

      // this.setMarkers();

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

      const markers = [
        marker([start.lat, start.long]),
        marker([end.lat, end.long])
      ];

      console.log('set marker', markers);

      this.markers$.next(markers);
      if (this.map) {
        const group = featureGroup([marker([start.lat, start.long]), marker([end.lat, end.long])]);
        this.map.fitBounds(group.getBounds(), { maxZoom: 14, padding: point(20, 20)});
      }
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
    console.log('onMap');
    this.map = map;

    setTimeout(() => {
      console.log('onMap - settingMarkers');
      this.setMarkers();
    }, 100);
  }
}
