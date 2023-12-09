import { Component, OnInit } from "@angular/core";
import { UiService } from "../../../services/ui.service";

@Component({
  selector: 'trains-vehicle-types-page',
  templateUrl: './vehicle-types.page.html',
  styleUrls: ['./vehicle-types.page.scss']
})
export class VehicleTypesPage implements OnInit {
  constructor(private readonly uiService: UiService) {}

  ngOnInit() {
    this.uiService.setPageTitle('page.vehicleType.listTitle');
  }
}
