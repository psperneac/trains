import {getSelectors, routerReducer} from '@ngrx/router-store';
import {createSelector} from '@ngrx/store';

export interface AppState {
  router: any;
}

export const initialState: AppState = {
  router: undefined,
};

export const reducers = {
  router: routerReducer,
};

export const metaReducers = [];

// router selectors
export const routerSelectors = getSelectors((state: AppState) => state.router);
export const routerSelectReturnUrl = createSelector(routerSelectors.selectQueryParam('returnUrl'), param => param);
