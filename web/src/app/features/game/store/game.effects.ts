import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { GameService } from '../services/game.service';

@Injectable()
export class GameEffects {
  constructor(private readonly actions$: Actions, private readonly gameService: GameService) {}
}
