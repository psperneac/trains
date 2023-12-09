import {createAction, props, union} from '@ngrx/store';

export const alertError = createAction('[Alert] Error', props<{message: any}>());
export const alertWarning = createAction('[Alert] Warning', props<{message: any}>());
export const alertInfo = createAction('[Alert] Info', props<{message: any}>());

const alertActions = union({
  alertError,
  alertWarning,
  alertInfo
});
export type AlertActions = typeof alertActions;

