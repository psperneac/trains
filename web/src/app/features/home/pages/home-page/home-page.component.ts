import { Component, OnInit } from '@angular/core';
import {latLng, Layer, tileLayer} from 'leaflet';
import {UiService} from '../../../../services/ui.service';

@Component({
  selector: 'trains-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  options = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 5,
    center: latLng(46.879966, -121.726909)
  };

  markers: Layer[] = [];

  constructor(private readonly uiService: UiService) { }

  ngOnInit(): void {
    this.uiService.setPageTitle('page.home.title');
  }

}
