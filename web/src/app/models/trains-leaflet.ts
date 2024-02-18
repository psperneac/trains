import { LatLngExpression, Marker, MarkerOptions, Polyline, PolylineOptions } from 'leaflet';

export class TrainsMarker extends Marker {
  constructor(public name: string, latlng: LatLngExpression, options?: MarkerOptions) {
    super(latlng, options);
  }
}

export class TrainsLine extends Polyline {
  constructor(public name: string, latlngs: LatLngExpression[], options?: PolylineOptions) {
    super(latlngs, options);
  }
}
