import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { PlayerDto } from '../../services/player.service';
import { GamesFacade } from '../../services/games.facade';
import { PlayersFacade } from '../../store/player/player.facade';
import { selectAuthState, selectIsAdmin, selectUserId } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MatCardModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private gamesFacade = inject(GamesFacade);
  private playersFacade = inject(PlayersFacade);
  private store = inject(Store);

  games$ = this.gamesFacade.allGames$;
  loading$ = this.gamesFacade.loading$;
  error$ = this.gamesFacade.error$;
  players$ = this.playersFacade.players$;
  playersLoading$ = this.playersFacade.loading$;
  selectedPlayer$ = this.playersFacade.selectedPlayer$;

  selectedGameId: string = '';
  isAdmin$: Observable<boolean>;
  currentPlayerId$: Observable<string | null>;
  userId$: Observable<string | null>;

  // Local filtered players based on selected game
  playersForGame: PlayerDto[] = [];
  
  // All players for the current user (needed for game select count)
  private allUserPlayers: PlayerDto[] = [];
  private currentSelectedGame: any = null;

  constructor() {
    this.isAdmin$ = this.store.select(selectIsAdmin);
    this.currentPlayerId$ = this.store.select(selectAuthState).pipe(
      map(state => state.currentPlayerId)
    );
    this.userId$ = this.store.select(selectUserId);

    // Subscribe to players changes to track all user players
    this.players$.subscribe(players => {
      this.allUserPlayers = players;
      this.updatePlayersForGame();
    });

    // Subscribe to game changes
    this.gamesFacade.selectedGame$.subscribe(game => {
      this.currentSelectedGame = game;
      this.updatePlayersForGame();
    });
  }

  private updatePlayersForGame(): void {
    if (!this.currentSelectedGame) {
      this.playersForGame = [];
      return;
    }
    this.playersForGame = this.allUserPlayers.filter(p => p.gameId === this.currentSelectedGame.id);
  }

  ngOnInit(): void {
    // When userId is available, load players for that user
    this.userId$.pipe(
      filter(userId => !!userId)
    ).subscribe(userId => {
      if (userId) {
        this.playersFacade.loadPlayersByUserId(userId);
      }
    });

    // Subscribe to selected game changes
    this.gamesFacade.selectedGame$.pipe(
      filter(game => !!game)
    ).subscribe(game => {
      if (game) {
        this.selectedGameId = game.id;
      }
    });
  }

  onGameChange(gameId: string): void {
    this.selectedGameId = gameId;

    if (gameId) {
      this.games$.pipe(
        map(games => games.find(g => g.id === gameId)),
        filter(g => !!g)
      ).subscribe(game => {
        if (game) {
          this.gamesFacade.setSelectedGame(game);
        }
      });
    } else {
      this.gamesFacade.setSelectedGame(null);
    }
  }

  selectPlayer(player: PlayerDto): void {
    this.playersFacade.setSelectedPlayer(player);
  }

  clearError(): void {
    this.gamesFacade.clearError();
  }

  createNewGame(): void {
    console.log('Create new game');
  }

  getPlayerCountForGame(gameId: string): number {
    return this.allUserPlayers.filter(p => p.gameId === gameId).length;
  }
}