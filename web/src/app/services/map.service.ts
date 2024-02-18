import { Injectable } from '@angular/core';
import { FeatureGroup, icon, LatLng, Marker } from 'leaflet';
import { TrainsLine, TrainsMarker } from '../models/trains-leaflet';
import * as uuid from 'uuid';

export interface MakeMarkerOptions {
  name?: string;
  dragEndListener?: (marker: Marker, latLng: LatLng) => void;
}

@Injectable({ providedIn: 'root' })
export class MapService {
  icBlue = icon({
    iconUrl: 'icons/circle-blue-64.png',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  icRed = icon({
    iconUrl: 'icons/circle-red-64.png',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  icGreen = icon({
    iconUrl: 'icons/circle-green-64.png',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  icYellow = icon({
    iconUrl: 'icons/circle-yellow-64.png',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  get iconRed() {
    return this.icRed;
  }

  get iconYellow() {
    return this.icYellow;
  }

  iconYellowWithClass(className: string) {
    return icon({
      iconUrl: 'icons/circle-yellow-64.png',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
      className
    });
  }

  get iconGreen() {
    return this.icGreen;
  }

  get iconBlue() {
    return this.icBlue;
  }

  makeMarker(aLatLong, options?: MakeMarkerOptions): TrainsMarker {
    const name = options.name ?? uuid.v4();
    const aMarker = new TrainsMarker(name, aLatLong, { icon: this.iconGreen, draggable: true })
      .bindTooltip(name,
        {
          permanent: true,
          direction: 'top'
        });

    if (options?.dragEndListener) {
      aMarker.on('dragend', (event) => {
        const latlng = event.target.getLatLng();
        options.dragEndListener(aMarker, latlng);
      });
    }

    return aMarker;
  }

  makeStartEndMarker(aLatLong, options?: MakeMarkerOptions): TrainsMarker {
    const name = options?.name ?? uuid.v4();
    const aMarker = new TrainsMarker(name, aLatLong, { icon: this.iconBlue, draggable: false });

    if (options?.dragEndListener) {
      aMarker.on('dragend', (event) => {
        const latlng = event.target.getLatLng();
        options.dragEndListener(aMarker, latlng);
      });
    }

    return aMarker;
  }

  getAllMarkerNames(featureGroup: FeatureGroup) {
    const ret = [];
    featureGroup.eachLayer((layer) => {
        if (layer instanceof TrainsMarker) {
          ret.push(layer.name);
        }
      }
    );
    return ret;
  }

  getAllLineNames(featureGroup: FeatureGroup) {
    const ret = [];
    featureGroup.eachLayer((layer) => {
        if (layer instanceof TrainsLine) {
          ret.push(layer.name);
        }
      }
    );
    return ret;
  }
}
