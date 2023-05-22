import { Injectable } from '@angular/core';
import { icon } from 'leaflet';

@Injectable({ providedIn: 'root' })
export class MapService {
  icBlue = icon({
    iconUrl: 'icons/circle-blue-64.png',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  icRed = icon({
    iconUrl: 'icons/circle-red-64.png',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  icGreen = icon({
    iconUrl: 'icons/circle-green-64.png',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  get iconRed() {
    return this.icRed;
  }

  get iconGreen() {
    return this.icGreen;
  }

  get iconBlue() {
    return this.icBlue;
  }
}
