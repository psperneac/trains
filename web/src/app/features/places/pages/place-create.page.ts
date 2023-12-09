import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {PlaceDto} from '../../../models/place.model';
import {latLng, Layer, marker, tileLayer} from 'leaflet';
import {PLACE_MAP_DEFAULT_ZOOM, PLACES} from '../../../utils/constants';
import {Subject} from 'rxjs';
import {PlaceActions} from '../store';
import {Store} from '@ngrx/store';
import {AppState} from '../../../store';
import {UiService} from '../../../services/ui.service';
import {PlaceFormComponent} from '../components/place-form.component';
import {Router} from '@angular/router';

@Component({
  selector: 'trains-place-create-page',
  templateUrl: './place-create.page.html',
  styleUrls: ['./place-create.page.scss']
})
export class PlaceCreatePage implements OnInit, OnDestroy {
  destroy$ = new Subject();

  place: PlaceDto;

  options = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: PLACE_MAP_DEFAULT_ZOOM,
    center: latLng(46.879966, -121.726909)
  };

  map: L.Map;
  markers: Layer[] = [];

  @ViewChild('placeForm')
  form: PlaceFormComponent;

  constructor(
    private store: Store<AppState>,
    private readonly router: Router,
    private readonly uiService: UiService
  ) {
  }

  ngOnInit(): void {
    this.place = {
      name: '',
      description: '',
      lat: 45.753567,
      lng: 21.225689
    } as PlaceDto;

    if (this.map) {
      console.log('Has map');
      console.dir(this.place);
      this.moveMarker(this.place);
    }

    this.uiService.setPageTitle('page.place.createTitle');
  }

  private moveMarker(place: PlaceDto) {
    const currentPosition = marker([place.lat, place.lng], { draggable: true });
    const self = this;
    currentPosition.on('dragend', function(_e) {
      self.place.lat = currentPosition.getLatLng().lat;
      self.place.lng = currentPosition.getLatLng().lng;
      if (self.form) {
        self.form.externalPlaceUpdate(self.place);
      }
    });
    this.markers = [currentPosition];
    this.map.setView(latLng(place.lat, place.lng), this.map.getZoom());
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  onMap(map: L.Map) {
    this.map = map;
    this.moveMarker(this.place);
  }

  placeChanged($event: PlaceDto) {
    this.place = { ...this.place, ...$event };
    this.moveMarker(this.place);
  }

  movePin() {
    console.log('move the pin');
  }

  onCancel() {
    this.router.navigateByUrl(PLACES);
  }

  onSave() {
    this.store.dispatch(PlaceActions.create({payload: this.place}));
    this.router.navigateByUrl(PLACES);
  }
}
