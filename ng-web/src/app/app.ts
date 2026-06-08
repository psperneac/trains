import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { AuthActions, selectIsAuthenticated } from './store/auth';
import { LayoutComponent } from './components/layout/layout';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LayoutComponent],
  template: `
    @if (isAuthenticated$ | async) {
      <app-layout title="Welcome">
        <router-outlet />
      </app-layout>
    } @else {
      <router-outlet />
    }
  `,
})
export class App implements OnInit {
  private store = inject(Store);

  isAuthenticated$ = this.store.select(selectIsAuthenticated);

  ngOnInit(): void {
    this.store.dispatch(AuthActions.initializeAuth());
  }
}
