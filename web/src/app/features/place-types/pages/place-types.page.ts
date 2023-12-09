import { Component, OnInit } from "@angular/core";
import { UiService } from "../../../services/ui.service";

@Component({
  selector: 'trains-place-types-page',
  templateUrl: './place-types.page.html',
  styleUrls: ['./place-types.page.scss']
})
export class PlaceTypesPage implements OnInit {
  constructor(private readonly uiService: UiService) {}

  ngOnInit() {
    this.uiService.setPageTitle('page.placeType.listTitle');
  }
}
