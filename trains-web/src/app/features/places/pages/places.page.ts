import { Component, OnInit } from '@angular/core';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'trains-places-page',
  templateUrl: './places.page.html',
  styleUrls: ['./places.page.scss']
})
export class PlacesPage implements OnInit {

  constructor(
    private readonly uiService: UiService) {
    console.log('Places page constructor');
  }

  ngOnInit(): void {
    this.uiService.setPageTitle('page.place.listTitle');
    console.log('Places page init');
  }
}
