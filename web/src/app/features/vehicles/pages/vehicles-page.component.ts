import { Component, OnInit } from '@angular/core';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'trains-vehicles-page',
  templateUrl: './vehicles-page.component.html',
  styleUrls: ['./vehicles-page.component.scss']
})
export class VehiclesPage implements OnInit {
  constructor(private readonly uiService: UiService) {}

  ngOnInit() {
    this.uiService.setPageTitle('page.vehicle.listTitle');
  }
}
