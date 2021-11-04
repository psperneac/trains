import { AppState } from '../../../store';
import { createSelector } from '@ngrx/store';
import { placesAdapter, PlacesState } from './place.reducer';
import { AbstractSelectors } from '../../../helpers/abstract.selectors';
import {PlaceDto} from "../../../models/place.model";

const selectors = placesAdapter.getSelectors();

export class PlaceSelectorsType extends AbstractSelectors<PlaceDto> {
  constructor() {
    super();

    this.PlacesState = (state: AppState) => state['places'] as PlacesState;
    this.Ids = createSelector(this.PlacesState, selectors.selectIds);
    this.All = createSelector(this.PlacesState, selectors.selectAll);
    this.Entities = createSelector(this.PlacesState, selectors.selectEntities);
    this.Loading = createSelector(this.PlacesState, (state: PlacesState) => state.loading);
    this.Loaded = createSelector(this.PlacesState, (state: PlacesState) => state.loaded);
    this.Error = createSelector(this.PlacesState, (state: PlacesState) => state.error);
    this.TotalCount = createSelector(this.PlacesState, (state: PlacesState) => state.totalCount);
    this.Limit = createSelector(this.PlacesState, (state: PlacesState) => state.limit);
    this.Page = createSelector(this.PlacesState, (state: PlacesState) => state.page);
    this.Filter = createSelector(this.PlacesState, (state: PlacesState) => state.filter);
    this.SortColumn = createSelector(this.PlacesState, (state: PlacesState) => state.sortColumn);
    this.SortDirection = createSelector(this.PlacesState, (state: PlacesState) => state.sortDescending ? 'desc' : 'asc');
    this.SelectedLoading = createSelector(this.PlacesState, (state: PlacesState) => state.selectedLoading);
    this.SelectedLoaded = createSelector(this.PlacesState, (state: PlacesState) => state.selectedLoaded);
    this.Selected = createSelector(this.PlacesState, (state: PlacesState) => state.selected);
  }
}

export const PlaceSelectors = new PlaceSelectorsType();
