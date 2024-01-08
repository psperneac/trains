import { Component, OnInit } from '@angular/core';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'trains-places-page',
  template: '<trains-places-list></trains-places-list>',
})
export class PlacesPage implements OnInit {
  constructor(private readonly uiService: UiService) {}

  ngOnInit(): void {
    this.uiService.setPageTitle('page.place.listTitle');
  }
}
