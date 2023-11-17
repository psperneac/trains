import { Component, OnInit } from '@angular/core';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'trains-players-page',
  templateUrl: './players.page.html',
  styleUrls: ['./players.page.scss']
})
export class PlayersPage implements OnInit {

  constructor(private readonly uiService: UiService){
  }

  ngOnInit(): void {
    this.uiService.setPageTitle('page.player.listTitle');
  }
}
