import { LatLngExpression, Marker, MarkerOptions } from 'leaflet';

export class TrainsMarker extends Marker {
  constructor(public name: string, latlng: LatLngExpression, options?: MarkerOptions) {
    super(latlng, options);
  }
}
