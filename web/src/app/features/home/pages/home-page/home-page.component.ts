import { Component, OnDestroy, OnInit } from '@angular/core';
import {latLng, Layer, tileLayer} from 'leaflet';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {UiService} from '../../../../services/ui.service';
import { GameDataService } from '../../../game/services/game-data.service';

@Component({
  selector: 'trains-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit, OnDestroy {
  destroy$ = new Subject();

  options = {
    layers: [
      tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 5,
    center: latLng(46.879966, -121.726909)
  };

  markers: Layer[] = [];

  constructor(
    private readonly uiService: UiService,
    private readonly gameDataService: GameDataService
  ) { }

  ngOnInit(): void {
    this.uiService.setPageTitle('page.home.title');

    this.gameDataService.getSelectedPlayer$().pipe(takeUntil(this.destroy$)).subscribe(player => {
      console.log('Player', player);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
