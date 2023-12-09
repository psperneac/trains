/// <reference types='leaflet-loading' />
/// <reference types='leaflet.locatecontrol' />
/// <reference types='@runette/leaflet-fullscreen' />
import 'leaflet';
import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import {
  Control,
  DomUtil,
  latLng,
  Layer,
  LeafletEvent,
  MapOptions,
  LoadingOptions,
  FullscreenOptions,
  tileLayer, LocationEvent
} from 'leaflet';
import {
  PLACE_MAP_DEFAULT_MAX_ZOOM,
  PLACE_MAP_DEFAULT_OPACITY,
  PLACE_MAP_DEFAULT_ZOOM
} from '../../utils/constants';

declare module 'leaflet' {
  interface Control {
    _addTo(map: Map): Control;
  }
  interface Map {
    _leaflet_id: number;
    _container: HTMLElement;
  }
}

@Component({
  selector: 'trains-custom-map',
  templateUrl: './custom-map.component.html',
  styleUrls: ['./custom-map.component.scss']
})
export class CustomMapComponent implements OnInit, OnDestroy {
  @Output() mapChanged: EventEmitter<L.Map> = new EventEmitter();
  @Output() zoomEnd: EventEmitter<number> = new EventEmitter();
  @Output() addClicked = new EventEmitter<any>();

  @Input() options: MapOptions= {
    layers:[tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      opacity: PLACE_MAP_DEFAULT_OPACITY,
      maxZoom: PLACE_MAP_DEFAULT_MAX_ZOOM,
      detectRetina: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })],
    zoom: PLACE_MAP_DEFAULT_ZOOM,
    center: latLng(46.879966, -121.726909)
  };
  @Input() layers: Layer[] = [];
  @Input() loadingOptions: LoadingOptions={
    position: 'topleft',
  };
  @Input() locateOptions: Control.LocateOptions= {
    flyTo: false,
    keepCurrentZoomLevel: true,
    locateOptions: {
      enableHighAccuracy: true,
    },
    icon: 'material-icons md-18 target icon',
    clickBehavior: {inView: 'stop',
      outOfView: 'setView',
      inViewNotFollowing: 'setView'}
  };
  @Input() fullscreenOptions: FullscreenOptions = {
    position: 'topleft',
    pseudoFullscreen: false,
    title: {true:'Exit Fullscreen',
      false: 'View Fullscreen',
    }
  };

  @Input()
  addEnabled = false;

  public map: L.Map;
  public zoom: number;

  constructor() {
  }

  ngOnInit() {
    // Use a compact attribution control for small map container widths
    if (! Control.Attribution.prototype._addTo) {
      Control.Attribution.prototype._addTo = Control.Attribution.prototype.addTo;

      Control.Attribution.prototype.addTo = function(map) {
        Control.Attribution.prototype._addTo.call(this, map);

        // use the css checkbox hack to toggle the attribution
        const parent     = this._container.parentNode;
        const checkbox   = document.createElement('input');
        const label      = document.createElement('label');
        const checkboxId = 'attribution-toggle-' + map._leaflet_id;  // unique name if multiple maps are present

        checkbox.setAttribute('id', checkboxId);
        checkbox.setAttribute('type', 'checkbox');
        checkbox.classList.add('leaflet-compact-attribution-toggle');
        parent.insertBefore(checkbox, parent.firstChild);

        label.setAttribute('for', checkboxId);
        label.classList.add('leaflet-control');
        label.classList.add('leaflet-compact-attribution-label');
        parent.appendChild(label);

        // initial setup for map load
        if (map._container.offsetWidth <= 600) {
          DomUtil.addClass(this._container, 'leaflet-compact-attribution');
        }

        // update on map resize
        map.on('resize', function() {
          if (map._container.offsetWidth > 600) {
            DomUtil.removeClass(this._container, 'leaflet-compact-attribution');
          } else {
            DomUtil.addClass(this._container, 'leaflet-compact-attribution');
          }
        }, this);
        return this;
      };
    }
  }

  ngOnDestroy() {
    this.map.clearAllEventListeners();
    // this.map.remove();
  };

  onMapReady(map: L.Map) {
    console.log('onMapReady: %O', map);
    this.map = map;
    this.mapChanged.emit(map);
    this.zoom = map.getZoom();
    this.zoomEnd.emit(this.zoom);

    setTimeout(() => {
      this.map.invalidateSize();
      // this.map.addControl(new Control({
      //   position: 'topleft',
      // }));
    });

    this.map.on("click", e => {
      console.log('Click on map: %O', e); // get the coordinates
    });

  }

  onMapZoomEnd(e: LeafletEvent) {
    this.zoom = e.target.getZoom();
    this.zoomEnd.emit(this.zoom);
  }

  onNewLocation($event: LocationEvent) {
    console.log('onNewLocation: %O', $event);
  }

  clickAdd($event) {
    $event.preventDefault();
    $event.stopPropagation();
    console.log('Clicked');
    this.addClicked.emit($event);
  }
}
