/*

Clone in TS of https://github.com/openplans/Leaflet.AnimatedMarker

Changes:
- Converted to TS and @asymmetrik/ngx-leaflet (https://github.com/bluehalo/ngx-leaflet)
- Fixed initial delay
- Fixed accessing icon as angular HTMLElement

Copyright (c) 2012, OpenPlans

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */
import { DivIcon, DomUtil, Icon, LatLng, LatLngExpression, Map, Marker, MarkerOptions } from 'leaflet';
import GeometryUtil from 'leaflet-geometryutil';

export interface AnimatedMarkerOptions extends MarkerOptions {
  distance?: number;
  interval?: number;
  autoStart?: boolean;
  onEnd?: () => void;
  clickable?: boolean;
}

export class AnimatedMarker extends Marker {
  distance: number;
  interval: number;
  autoStart: boolean;
  onEnd: () => void;
  clickable: boolean;
  latlngs: LatLng[];
  i: number;

  icon: Icon | DivIcon;
  tid;

  constructor(public map: Map, public name: string, public className: string, line: LatLngExpression[], options?: AnimatedMarkerOptions) {
    super(line[0], options);

    this.distance = options.distance ?? 200;
    this.interval = options.interval ?? 1000;
    this.autoStart = options.autoStart ?? true;
    this.onEnd = options.onEnd ?? (() => {});
    this.clickable = options.clickable ?? false;

    this.icon = options.icon;
    // this.shadow = options.shadow;

    this.setLine(line);
  }

  setLine(latlngs){
    const lengths = GeometryUtil.accumulatedLengths(latlngs);
    const totalLength = lengths.reduce((a, b) => a + b, 0);

    console.log('distance with GeometryUtil', totalLength);

    const middle = GeometryUtil.interpolateOnLine(this.map, latlngs, 0.5);
    new Marker(middle.latLng).addTo(this.map);

    if (DomUtil.TRANSITION) {
      // No need to to check up the line if we can animate using CSS3
      this.latlngs = latlngs;
    } else {
      // Chunk up the lines into options.distance bits
      this.latlngs = this._chunk(latlngs);
      this.distance = 10;
      this.interval = 30;
    }
    this.i = 0;
  }

  // Breaks the line up into tiny chunks (see options) ONLY if CSS3 animations
  // are not supported.
  _chunk(latlngs) {

    var i,
    len = latlngs.length,
    chunkedLatLngs = [];

    for (i=1;i<len;i++) {
      var cur = latlngs[i-1],
      next = latlngs[i],
      dist = cur.distanceTo(next),
      factor = this.distance / dist,
      dLat = factor * (next.lat - cur.lat),
      dLng = factor * (next.lng - cur.lng);

      if (dist > this.distance) {
        while (dist > this.distance) {
          cur = new LatLng(cur.lat + dLat, cur.lng + dLng);
          dist = cur.distanceTo(next);
          chunkedLatLngs.push(cur);
        }
      } else {
        chunkedLatLngs.push(cur);
      }
    }
    chunkedLatLngs.push(latlngs[len-1]);

    return chunkedLatLngs;
  }

  onAdd(map): any {
    super.onAdd(map);

    // Start animating when added to the map
    if (this.autoStart) {
      this.start();
    }

    return this;
  }

  animate() {
    var self = this,
      len = this.latlngs.length,
      speed = this.interval;

    // Normalize the transition speed from vertex to vertex
    if (this.i < len && this.i > 0) {
      speed = this.latlngs[this.i-1].distanceTo(this.latlngs[this.i]) / this.distance * this.interval;
    } else if (this.i === 0) {
      speed = 1;
    }

    // Only if CSS3 transitions are supported
    if (DomUtil.TRANSITION) {
      if (this.icon) {
        const icons = document.getElementsByClassName(this.className);
        for(let iEl = 0; iEl < icons.length; iEl++) {
          const ic = icons.item(iEl) as HTMLElement;
          ic.style[DomUtil.TRANSITION] = ('all ' + speed + 'ms linear');
        }
      }
      // if (this.shadow) { this._shadow.style[DomUtil.TRANSITION] = 'all ' + speed + 'ms linear'; }
    }

    // Move to the next vertex
    this.setLatLng(this.latlngs[this.i]);
    this.i++;

    // Queue up the animation to the next next vertex
    this.tid = setTimeout(function(){
      if (self.i === len) {
        self.onEnd();
      } else {
        self.animate();
      }
    }, speed);
  }

  // Start the animation
  start() {
    this.animate();
  }

  // Stop the animation in place
  stop() {
    if (this.tid) {
      clearTimeout(this.tid);
    }
  }

}
