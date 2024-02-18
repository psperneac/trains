import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { cloneDeep, isNil, sortBy, uniqBy } from 'lodash-es';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import {
  SelectPlaceConnectionComponent
} from '../../../components/select-place-connection/select-place-connection.component';
import { MapTemplateDto } from '../../../models/map-template.model';
import { PlaceConnectionDto } from '../../../models/place-connection.model';
import { PlaceDto } from '../../../models/place.model';
import { TrainsLine, TrainsMarker } from '../../../models/trains-leaflet';
import { MapService } from '../../../services/map.service';
import { UiService } from '../../../services/ui.service';
import { AppState } from '../../../store';
import { MAP_TEMPLATES, MAP_TEMPLATE_MAP_DEFAULT_ZOOM } from '../../../utils/constants';
import { PlaceConnectionDataService } from '../../place-connections/services/place-connection-data.service';
import { PlaceDataService } from '../../places/services/place-data.service';
import { MapTemplateFormComponent } from '../components/map-template-form.component';
import { Actions, ofType } from '@ngrx/effects';
import { MapPlaceConnectionDataService } from '../services/map-place-connection-data.service';
import { MapPlaceDataService } from '../services/map-place-data.service';
import { MapPlaceConnectionActions } from '../store/map-place-connection.store';
import { MapPlaceActions } from '../store/map-place.store';
import { MapTemplateActions, MapTemplateSelectors } from '../store/map-template.store';
import { Layer, latLng, tileLayer, LayerGroup, LatLng, point, FeatureGroup, polyline } from 'leaflet';
import { MatDialog } from '@angular/material/dialog';
import { SelectPlaceComponent } from '../../../components/select-place/select-place.component';

export interface DisplayPlace {
  place: PlaceDto;
  added: boolean;
  deleted: boolean;
}

export interface DisplayPlaceConnection {
  placeConnection: PlaceConnectionDto;
  startPlace: PlaceDto;
  endPlace: PlaceDto;

  added: boolean;
  deleted: boolean;
}

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

  mapTemplate$ = this.store.pipe(select(MapTemplateSelectors.Selected), filter(map => !!map));

  allPlaces$ = this.placeDataService.places$.pipe(filter(places => !isNil(places)));
  allPlaceConnections$ = this.placeConnectionDataService.placeConnections$.pipe(filter(placeConnections => !isNil(placeConnections)));

  mapPlaces$ = this.mapTemplate$.pipe(
    filter(mapTemplate => !isNil(mapTemplate)),
    switchMap(mapTemplate =>
      this.mapPlaceDataService.mapPlacesByMapId$(mapTemplate.id)),
  );
  mapPlaceConnections$ = this.mapTemplate$.pipe(
    filter(mapTemplate => !isNil(mapTemplate)),
    switchMap(mapTemplate =>
      this.mapPlaceConnectionDataService.mapPlaceConnectionsByMapId$(mapTemplate.id)),
  );

  toAddPlaces$ = new BehaviorSubject<PlaceDto[]>([]);
  toAddPlaceConnections$ = new BehaviorSubject<PlaceConnectionDto[]>([]);

  availablePlacesToAdd$ = combineLatest([this.allPlaces$, this.mapPlaces$, this.toAddPlaces$]).pipe(
    filter(([allPlaces, mapPlaces, toAddPlaces]) => !isNil(allPlaces) && !isNil(mapPlaces) && !isNil(toAddPlaces)),
    map(([allPlaces, mapPlaces, toAddPlaces]) => {
      const mapPlaceIds = mapPlaces.map(mp => mp.placeId);
      const toAddPlacesIds = toAddPlaces.map(p => p.id);
      const ret = allPlaces.filter(p => !mapPlaceIds.includes(p.id) && !toAddPlacesIds.includes(p.id));
      return ret;
    }),
  );
  hasAvailablePlacesToAdd$ = this.availablePlacesToAdd$.pipe(
    map(places => places.length > 0),
  );

  currentMapPlaces$ = combineLatest([this.allPlaces$, this.mapPlaces$, this.toAddPlaces$]).pipe(
    map(([allPlaces, mapPlaces, toAddPlaces]) => {
      const mapPlaceIds = mapPlaces.map(mp => mp.placeId);
      const toAddPlacesIds = toAddPlaces.map(p => p.id);
      const ret = allPlaces
        .filter(p => mapPlaceIds.includes(p.id) || toAddPlacesIds.includes(p.id))
        .map(p => ({ place: p, added: toAddPlacesIds.includes(p.id) }));
      return sortBy(ret, 'place.name');
    }),
  );

  // all place connections not yet associated with the map that have start and end in the currentMapPlaces$
  availablePlaceConnectionsToAdd$ = combineLatest([
    this.allPlaceConnections$,
    this.allPlaces$,
    this.mapPlaceConnections$,
    this.toAddPlaceConnections$,
    this.currentMapPlaces$]).pipe(
    map(([allPlaceConnections, allPlaces, mapPlaceConnections, toAddPlaceConnections, currentMapPlaces]) => {
      const currentPlaceIds = currentMapPlaces.map(p => p.place.id);
      const mapPlaceConnectionIds = mapPlaceConnections.map(mp => mp.placeConnectionId);
      const toAddPlaceConnectionIds = toAddPlaceConnections.map(pc => pc.id);

      const ret = allPlaceConnections.filter(pc =>
        currentPlaceIds.includes(pc.startId) && currentPlaceIds.includes(pc.endId) &&
        (!mapPlaceConnectionIds.includes(pc.id) && !toAddPlaceConnectionIds.includes(pc.id)))
        .map(pc => ({ placeConnection: pc, startPlace: allPlaces.find(p => p.id === pc.startId), endPlace: allPlaces.find(p => p.id === pc.endId) }))

      return ret;
    }),
  );
  hasAvailablePlaceConnectionsToAdd$ = this.availablePlaceConnectionsToAdd$.pipe(
    map(placeConnections => placeConnections.length > 0),
  );

  currentMapPlaceConnections$ = combineLatest([
    this.allPlaces$,
    this.allPlaceConnections$,
    this.mapPlaceConnections$,
    this.toAddPlaceConnections$
  ]).pipe(
    map(([allPlaces, allPlaceConnections, mapPlaceConnections, toAddPlaceConnections]) => {
      const mapPlaceConnectionIds = mapPlaceConnections.map(mp => mp.placeConnectionId);
      const toAddPlaceConnectionIds = toAddPlaceConnections.map(pc => pc.id);
      const ret = allPlaceConnections
        .filter(pc => mapPlaceConnectionIds.includes(pc.id) || toAddPlaceConnectionIds.includes(pc.id))
        .map(pc => ({
          placeConnection: pc,
          startPlace: allPlaces.find(p => p.id === pc.startId),
          endPlace: allPlaces.find(p => p.id === pc.endId),
          added: toAddPlaceConnectionIds.includes(pc.id)
        } as DisplayPlaceConnection));
      return sortBy(ret, 'placeConnection.name');
    }),
  );

  customButtons$ = combineLatest([this.hasAvailablePlacesToAdd$, this.hasAvailablePlaceConnectionsToAdd$]).pipe(
    map(([hasAvailablePlaces, hasAvailablePlaceConnectionsToAdd]) => {
      const ret = [];

      if (hasAvailablePlaceConnectionsToAdd) {
        ret.push({id: 'addConnection', value: 'Add Connection', eventName: 'addConnectionClicked'});
      }

      if (hasAvailablePlaces) {
        ret.push({ id: 'addPlace', value: 'Add Place', eventName: 'addPlaceClicked' });
      }

      ret.push({ id: 'print', value: 'Print', eventName: 'printClicked' });
      ret.push({ id: 'fit', value: 'Fit', eventName: 'fitClicked' });

      return ret;
    }),
  );

  featureGroup: FeatureGroup;

  constructor(
    private store: Store<AppState>,
    private readonly router: Router,
    private readonly uiService: UiService,
    readonly actions$: Actions,
    public dialog: MatDialog,
    public mapService: MapService,
    private readonly placeDataService: PlaceDataService,
    private readonly placeConnectionDataService: PlaceConnectionDataService,
    private readonly mapPlaceDataService: MapPlaceDataService,
    private readonly mapPlaceConnectionDataService: MapPlaceConnectionDataService,
  ) {}

  ngOnInit(): void {
    this.featureGroup = new FeatureGroup();

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

    this.currentMapPlaces$.pipe(
      filter(places => !!places),
      takeUntil(this.destroy$)).subscribe(currentMapPlaces => {
        let added = false;
        const allMarkerName = this.mapService.getAllMarkerNames(this.featureGroup);
        currentMapPlaces.forEach(place => {
          if (!allMarkerName.includes(place.place.name)) {
            const marker = this.mapService.makeMarker(new LatLng(place.place.lat, place.place.lng), { name: place.place.name });
            marker.addTo(this.featureGroup);
            added = true;
          }
        });

        if (added && this.lMap) {
          this.lMap.fitBounds(this.featureGroup.getBounds(), { maxZoom: 14, padding: point(20, 20) });
        }
      });

    this.currentMapPlaceConnections$.pipe(
      filter(placeConnections => !!placeConnections),
      takeUntil(this.destroy$)).subscribe(currentMapPlaceConnections => {
        let added = false;
        const allLineNames = this.mapService.getAllLineNames(this.featureGroup);
        currentMapPlaceConnections.forEach(placeConnection => {
          if(placeConnection.placeConnection && placeConnection.startPlace && placeConnection.endPlace) {
            const name = this.getConnectionName(placeConnection);

            if (!allLineNames.includes(name)) {
              const latlngs = [
                new LatLng(placeConnection.startPlace.lat, placeConnection.startPlace.lng),
                new LatLng(placeConnection.endPlace.lat, placeConnection.endPlace.lng)
              ];
              const line = new TrainsLine(name, latlngs, {color: 'blue', weight: 10, opacity: 0.4});
              line.addTo(this.featureGroup);

              added = true;
            }
          }
        });

        if (added && this.lMap) {
          this.lMap.fitBounds(this.featureGroup.getBounds(), {maxZoom: 14, padding: point(20, 20)});
        }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);

    if (this.lMap) {
      this.featureGroup.removeFrom(this.lMap);
    }
  }

  onMap(map: L.Map) {
    this.lMap = map;
    this.map$.next(map);
    this.featureGroup.addTo(this.lMap);
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

    this.toAddPlaceConnections$.pipe(take(1)).subscribe(toAddPlaceConnections => {
      toAddPlaceConnections.forEach(placeConnection => {
        const payload = {payload: {id: undefined, mapId: this.map.id, placeConnectionId: placeConnection.id}};
        console.log('MapPlaceConnection - create', payload);
        this.store.dispatch(MapPlaceConnectionActions.create(payload));
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
    let dialogRef = this.dialog.open(SelectPlaceConnectionComponent, {
      data: { placesConnections$: this.availablePlaceConnectionsToAdd$ }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('addConnectionClicked', result);
      if (result?.value) {
        const value = uniqBy([...this.toAddPlaceConnections$.getValue(), ...result.value.map(dpc => dpc.placeConnection)], 'id');
        console.log('addConnectionClicked - next', value);
        this.toAddPlaceConnections$.next(value);
      }
    });
  }

  addPlaceClicked($event) {
    let dialogRef = this.dialog.open(SelectPlaceComponent, {
      data: { places$: this.availablePlacesToAdd$ }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.value) {
        const value = uniqBy([...this.toAddPlaces$.getValue(), ...result?.value], 'id');
        console.log('addConnectionClicked - next', value);
        this.toAddPlaces$.next(value);
      }
    });
  }

  private getConnectionName(placeConnection: DisplayPlaceConnection) {
    return `${placeConnection.startPlace.name} - ${placeConnection.endPlace.name}`;
  }

  printClicked($event: any) {
    this.lMap.eachLayer(layer => {
      if (layer instanceof LayerGroup) {
        layer.eachLayer(l => {
          if (l instanceof TrainsMarker) {
            console.log('Marker', l.name);
          } else if (l instanceof TrainsLine) {
            console.log('Line', l.name);
          }
        });
      }
    })
  }

  fitClicked($event: any) {
    this.lMap.fitBounds(this.featureGroup.getBounds(), { maxZoom: 14, padding: point(20, 20) });
  }
}
