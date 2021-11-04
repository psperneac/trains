import 'leaflet';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { latLng, Layer, marker, tileLayer } from 'leaflet';
import { select, Store } from '@ngrx/store';
import { PlaceSelectors } from '../store/place.selectors';
import { filter, take } from 'rxjs/operators';
import { AppState } from '../../../store';
import { cloneDeep, isNil } from 'lodash';
import { PlaceFormComponent } from '../components/place-form.component';
import { PLACE_MAP_DEFAULT_ZOOM } from '../../../utils/constants';
import { Subject } from 'rxjs';
import { UiService } from '../../../services/ui.service';
import { PlaceActions } from '../store';
import { PlaceDto } from "../../../models/place.model";

@Component({
  selector: 'trains-place-edit-page',
  templateUrl: './place-edit.page.html',
  styleUrls: ['./place-edit.page.scss']
})
export class PlaceEditPage implements OnInit, OnDestroy {
  destroy$ = new Subject();

  options = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: PLACE_MAP_DEFAULT_ZOOM,
    center: latLng(46.879966, -121.726909)
  };

  map: L.Map;
  markers: Layer[] = [];
  place: PlaceDto;

  @ViewChild('placeForm')
  form: PlaceFormComponent;

  constructor(
    private store: Store<AppState>,
    private readonly uiService: UiService
  ) {
  }

  ngOnInit(): void {
    this.uiService.setPageTitle('page.place.editTitle');
    this.store.pipe(select(PlaceSelectors.Selected), filter(place => !isNil(place)), take(1)).subscribe(place => {
      this.place = cloneDeep(place);

      if (this.map) {
        console.log('Has map');
        console.dir(place);
        this.moveMarker(place);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  private moveMarker(place: PlaceDto) {
    const currentPosition = marker([place.lat, place.long], { draggable: true });
    const self = this;
    currentPosition.on('dragend', function(e) {
      console.log(currentPosition.getLatLng());
      self.place.lat = currentPosition.getLatLng().lat;
      self.place.long = currentPosition.getLatLng().lng;
      if (self.form) {
        self.form.externalPlaceUpdate(self.place);
      }
      console.log(self.map.getZoom());
    });
    this.markers = [currentPosition];
    this.map.setView(latLng(place.lat, place.long), this.map.getZoom());
  }

  onMap(map: L.Map) {
    this.map = map;
    console.log('Map ready: %O', this.map);
  }

  placeChanged($event: PlaceDto) {
    this.place = { ...this.place, ...$event };
    this.moveMarker(this.place);
  }

  movePin() {
    console.log('move the pin');
  }

  onCancel() {

  }

  onSave() {
    this.store.dispatch(PlaceActions.update({payload: this.place}));
  }
}
