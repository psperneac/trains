import { createActionGroup, emptyProps, props } from '@ngrx/store';

export interface AuthUser {
  _id: string;
  username: string;
  email: string;
  scope: string;
}

export interface GameDto {
  id: string;
  name: string;
  description: string;
  type: string;
  content: any;
}

export interface PlayerDto {
  id: string;
  name: string;
  description: string;
  userId: string;
  gameId: string;
  wallet?: any;
  content: any;
}

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login': props<{ email: string; password: string }>(),
    'Login Success': props<{ authToken: string; user: AuthUser }>(),
    'Login Failure': props<{ error: string }>(),

    'Register': props<{ email: string; username: string; password: string }>(),
    'Register Success': props<{ authToken: string; user: AuthUser }>(),
    'Register Failure': props<{ error: string }>(),

    'Logout': emptyProps(),
    'Logout Success': emptyProps(),

    'Change Password': props<{ oldPassword: string; newPassword: string }>(),
    'Change Password Success': emptyProps(),
    'Change Password Failure': props<{ error: string }>(),

    'Initialize Auth': emptyProps(),
    'Restore Session': props<{ authToken: string; user: AuthUser }>(),

    'Set Current Game': props<{ game: GameDto | null }>(),
    'Set Current Player': props<{ player: PlayerDto | null }>(),

    'Clear Auth Error': emptyProps(),
  },
});
