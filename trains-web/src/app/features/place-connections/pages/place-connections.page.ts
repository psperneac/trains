import { Component, OnInit } from '@angular/core';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'trains-place-connections',
  templateUrl: './place-connections.page.html',
  styleUrls: ['./place-connections.page.scss']
})
export class PlaceConnectionsPage implements OnInit {
  constructor(private readonly uiService: UiService) {}

  ngOnInit() {
    this.uiService.setPageTitle('page.placeConnection.listTitle');
  }
}
