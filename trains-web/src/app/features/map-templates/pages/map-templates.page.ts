import { Component, OnInit } from '@angular/core';
import { UiService } from '../../../services/ui.service';

@Component({
    selector: 'trains-map-templates',
    template: '<trains-map-templates-list></trains-map-templates-list>',
    styleUrls: []
})
export class MapTemplatesPage implements OnInit {
    constructor(public readonly uiService: UiService) { }

    ngOnInit() {
      this.uiService.setPageTitle('page.mapTemplate.listTitle');
    }
}
