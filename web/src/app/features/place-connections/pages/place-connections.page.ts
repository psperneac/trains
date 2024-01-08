import { Component, OnInit } from '@angular/core';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'trains-place-connections',
  template: `<trains-place-connections-list></trains-place-connections-list>`,
})
export class PlaceConnectionsPage implements OnInit {
  constructor(private readonly uiService: UiService) {}

  ngOnInit() {
    this.uiService.setPageTitle('page.placeConnection.listTitle');
  }
}
