import { Component, Input, ViewChild, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { AuthActions } from '../../store/auth';
import { GamesFacade } from '../../services/games.facade';
import { PlayersFacade } from '../../store/player';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-layout',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatListModule,
    MatDividerModule,
    MatSidenavModule,
    RouterLink,
    RouterLinkActive,
    AsyncPipe,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent {
  @Input() title = '';
  @ViewChild('sidenav') sidenav: any;

  private store = inject(Store);

  protected gamesFacade = inject(GamesFacade);
  protected playersFacade = inject(PlayersFacade);

  selectedGame$ = this.gamesFacade.selectedGame$;
  selectedPlayer$ = this.playersFacade.selectedPlayer$;

  playerGame$ = combineLatest([this.selectedGame$, this.selectedPlayer$]).pipe(
    map(([game, player]) => {
      let ret = '';
      if (game && game.name) {
        ret += game.name;
      }
      if (player && player.name) {
        if (ret.length > 0) {
          ret += ' / ';
        }
        ret += player.name;
      }
      return ret;
    })
  )

  menuItems = [
    { label: 'Home', icon: 'home', path: '/' },
    { label: 'Games', icon: 'games', path: '/games' },
  ];

  adminItems = [
    { label: 'Place Types', path: '/game-admin/place-types' },
    { label: 'Vehicle Types', path: '/game-admin/vehicle-types' },
    { label: 'Vehicles', path: '/game-admin/vehicles' },
    { label: 'Places', path: '/game-admin/places' },
    { label: 'Place Connections', path: '/game-admin/place-connections' },
    { label: 'Games', path: '/game-admin/games' },
    { label: 'Players', path: '/game-admin/players' },
    { label: 'Transactions', path: '/game-admin/transactions' },
  ];

  userItems = [
    { label: 'Users', path: '/admin/users' },
  ];

  miscItems = [
    { label: 'Change Password', path: '/settings/change-password' },
    { label: 'Logout', action: 'logout' },
  ];

  onLogout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
