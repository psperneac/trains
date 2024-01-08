import { Component, OnInit } from '@angular/core';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'trains-players-page',
  template: `<trains-players-list></trains-players-list>`,
})
export class PlayersPage implements OnInit {
  constructor(private readonly uiService: UiService) {}

  ngOnInit(): void {
    this.uiService.setPageTitle('page.player.listTitle');
  }
}
