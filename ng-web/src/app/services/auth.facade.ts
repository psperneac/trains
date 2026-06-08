import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { AuthActions } from '../store/auth/auth.actions';
import {
  selectAuthToken,
  selectUserId,
  selectUserScope,
  selectCurrentGame,
  selectCurrentPlayer,
  selectIsLoading,
  selectAuthError,
  selectIsAuthenticated,
  selectIsAdmin,
} from '../store/auth/auth.selectors';
import { GameDto, PlayerDto } from '../store/auth/auth.actions';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * AuthFacadeService provides a simplified API for authentication operations.
 * It abstracts the complexity of the NgRx store and AuthService interactions,
 * offering a clean interface for components to manage authentication state.
 */
@Injectable({ providedIn: 'root' })
export class AuthFacadeService {
  private readonly authService = inject(AuthService);
  private readonly store = inject(Store);

  // ─── Observables for State Selection ─────────────────────────────────────

  /** Current authentication token (null if not authenticated) */
  readonly authToken$: Observable<string | null> = this.store.select(selectAuthToken);

  /** Current user's ID */
  readonly userId$: Observable<string | null> = this.store.select(selectUserId);

  /** Current user's scope (e.g., 'admin', 'user') */
  readonly userScope$: Observable<string | null> = this.store.select(selectUserScope);

  /** Current game context */
  readonly currentGame$: Observable<GameDto | null> = this.store.select(selectCurrentGame);

  /** Current player context */
  readonly currentPlayer$: Observable<PlayerDto | null> = this.store.select(selectCurrentPlayer);

  /** Loading state for auth operations */
  readonly isLoading$: Observable<boolean> = this.store.select(selectIsLoading);

  /** Error message from the last auth operation */
  readonly authError$: Observable<string | null> = this.store.select(selectAuthError);

  /** Whether the user is authenticated */
  readonly isAuthenticated$: Observable<boolean> = this.store.select(selectIsAuthenticated);

  /** Whether the user has admin scope */
  readonly isAdmin$: Observable<boolean> = this.store.select(selectIsAdmin);

  // ─── Authentication Actions ───────────────────────────────────────────────

  /**
   * Initialize auth state from localStorage.
   * Should be called once on app startup.
   */
  initializeAuth(): void {
    this.store.dispatch(AuthActions.initializeAuth());
  }

  /**
   * Login with email and password.
   * @param request - Login credentials
   * @returns Observable of the login response
   */
  login(request: LoginRequest): Observable<unknown> {
    return this.authService.login(request.email, request.password).pipe(
      tap((response: unknown) => {
        // The effect will handle dispatching the success action
        console.log('Login successful:', response);
      })
    );
  }

  /**
   * Register a new user account.
   * @param request - Registration details
   * @returns Observable of the registration response
   */
  register(request: RegisterRequest): Observable<unknown> {
    return this.authService.register(request.email, request.username, request.password).pipe(
      tap((response: unknown) => {
        console.log('Registration successful:', response);
      })
    );
  }

  /**
   * Logout the current user.
   * Clears local state and notifies the backend.
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.store.dispatch(AuthActions.logout());
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Still dispatch logout action to clear local state even if API fails
        this.store.dispatch(AuthActions.logout());
      }
    });
  }

  /**
   * Change the current user's password.
   * @param request - Current and new password
   * @returns Observable of the change password response
   */
  changePassword(request: ChangePasswordRequest): Observable<unknown> {
    return this.authService.changePassword(request.currentPassword, request.newPassword);
  }

  /**
   * Set the current game context.
   * @param game - Game to set as current
   */
  setCurrentGame(game: GameDto): void {
    this.store.dispatch(AuthActions.setCurrentGame({ game }));
  }

  /**
   * Set the current player context.
   * @param player - Player to set as current
   */
  setCurrentPlayer(player: PlayerDto): void {
    this.store.dispatch(AuthActions.setCurrentPlayer({ player }));
  }

  // ─── Utility Methods ───────────────────────────────────────────────────────

  /**
   * Get the raw auth token synchronously (from localStorage).
   * Useful for HTTP interceptors that need immediate token access.
   */
  getToken(): string | null {
    return this.authService.getToken();
  }

  /**
   * Check if the user is currently authenticated.
   * Returns a synchronous boolean by subscribing to the Observable briefly.
   * Note: Prefer using isAuthenticated$ Observable in components.
   */
  isAuthenticated(): boolean {
    return this.authService.getToken() !== null;
  }

  /**
   * Clear any auth error state.
   */
  clearAuthError(): void {
    // Dispatch an action to clear the error if one exists
    // Note: You may need to add a clearAuthError action to auth.actions.ts
    this.store.dispatch(AuthActions.clearAuthError());
  }
}