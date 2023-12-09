import { Injectable } from '@angular/core';
import { icon } from 'leaflet';

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
}
