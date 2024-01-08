import { UiService } from '../../../services/ui.service';
import { OnDestroy, OnInit, Component, ViewChild } from '@angular/core';
import { Subject, filter, take } from 'rxjs';
import { PlayerDto } from '../../../models/player';
import { PlayerFormComponent } from '../components/player-form.component';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../store';
import { Router } from '@angular/router';
import { PlayerActions, PlayerSelectors } from '../store';
import { cloneDeep, isNil } from 'lodash-es';
import { PLAYERS } from '../../../utils/constants';
import { Actions, ofType } from '@ngrx/effects';

@Component({
  selector: 'trains-player-edit-page',
  template: `
    <div class="app-full-height-page">
      <div class="player-form-page">
        <div class="player-form-container">
          <div class="player-actions">
            <button mat-button (click)="onSave()" [disabled]="!form?.valid()">{{ 'button.save' | translate }}</button>
            <button mat-button (click)="onCancel()">{{ 'button.cancel' | translate }}</button>
          </div>
          <trains-player-form
            #playerForm
            *ngIf="player"
            [player]="player"
            class="player-form"
            (valueChange)="playerChanged($event)"
          ></trains-player-form>
        </div>
      </div>
    </div>
  `,
})
export class PlayerEditPage implements OnInit, OnDestroy {
  destroy$ = new Subject();

  player: PlayerDto;

  @ViewChild('playerForm')
  form: PlayerFormComponent;

  constructor(
    private readonly store: Store<AppState>,
    private readonly router: Router,
    private readonly uiService: UiService,
    private readonly actions$: Actions,
  ) {}

  ngOnInit() {
    this.store
      .pipe(
        select(PlayerSelectors.Selected),
        filter((player) => !isNil(player)),
        take(1),
      )
      .subscribe((player) => {
        this.player = cloneDeep(player);
        if (this.player.id) {
          this.uiService.setPageTitle('page.player.editTitle');
        } else {
          this.uiService.setPageTitle('page.player.createTitle');
        }
      });
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

    this.actions$
      .pipe(
        ofType(
          PlayerActions.createSuccess,
          PlayerActions.createFailure,
          PlayerActions.updateSuccess,
          PlayerActions.updateFailure,
        ),
        take(1),
      )
      .subscribe((action) => {
        console.log('Player - save response', action);

        if (PlayerActions.isCreateSuccess(action) || PlayerActions.isUpdateSuccess(action)) {
          this.router.navigateByUrl(PLAYERS);
        }
      });
  }

  playerChanged($event: PlayerDto) {
    this.player = { ...this.player, ...$event };
  }
}
