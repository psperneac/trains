import { UiService } from './../../../services/ui.service';
import { OnDestroy, OnInit, Component, ViewChild } from '@angular/core';
import { Subject, filter, take } from 'rxjs';
import { PlayerDto } from '../../../models/player';
import { PlayerFormComponent } from '../components/player-form.component';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../store';
import { Router } from '@angular/router';
import { PlayerActions, PlayerSelectors } from '../store';
import { cloneDeep, isNil } from 'lodash';
import { PLAYERS } from '../../../utils/constants';

@Component({
  selector: 'trains-player-edit-page',
  templateUrl: './player-edit.page.html',
  styleUrls: ['./player-edit.page.scss']
})
export class PlayerEditPage implements OnInit, OnDestroy {
  destroy$ = new Subject();

  player: PlayerDto;

  @ViewChild('playerForm')
  form: PlayerFormComponent;

  constructor(
    private readonly store: Store<AppState>,
    private readonly router: Router,
    private readonly uiService: UiService
  ) {}

  ngOnInit() {
    this.store.pipe(
      select(PlayerSelectors.Selected),
      filter(player => !isNil(player)),
      take(1)
    ).subscribe(player => {
      this.player = cloneDeep(player);
      if (this.player.id) {
        this.uiService.setPageTitle('page.player.editTitle');
      } else {
        this.uiService.setPageTitle('page.player.createTitle');
      }
    })
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }

  onCancel() {
    this.router.navigateByUrl(PLAYERS);
  }

  onSave() {
    if (this.player.id) {
      this.store.dispatch(PlayerActions.update({ payload: this.player }));
    } else {
      this.store.dispatch(PlayerActions.create({ payload: this.player }));
    }
  }

  playerChanged($event: PlayerDto) {
    this.player = { ...this.player, ...$event };
  }
}
