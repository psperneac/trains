# NgRx Store Implementation Guide

This document describes how to implement a new NgRx data slice for the ng-web application.

## File Structure

Each data slice lives in its own folder under `src/app/store/` and consists of 4 files:

```text
store/[name]/
├── [name].state.ts      # State interface + reducer
├── [name].actions.ts    # Action definitions
├── [name].selectors.ts  # Selector functions
├── [name].effects.ts    # Side effects (API calls)
└── index.ts             # Barrel export
```

## 1. State File (`[name].state.ts`)

```typescript
import { createReducer, on } from '@ngrx/store';
import { [Name]Actions } from './[name].actions';

// State interface
export interface [Name]State {
  items: YourDto[];
  selectedItem: YourDto | null;
  loading: boolean;
  error: string | null;
}

// Initial state
export const initial[Name]State: [Name]State = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
};

// Reducer
export const [name]Reducer = createReducer(
  initial[Name]State,

  // Load actions (optimistic)
  on([Name]Actions.loadItems, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  // Success actions (update state)
  on([Name]Actions.loadItemsSuccess, (state, { items }) => ({
    ...state,
    items,
    loading: false,
    error: null,
  })),

  // Failure actions (set error, stop loading)
  on([Name]Actions.loadItemsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ... other actions
);
```

## 2. Actions File (`[name].actions.ts`)

```typescript
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const [Name]Actions = createActionGroup({
  source: '[Name]',
  events: {
    // Query actions (no payload for GET)
    'Load Items': emptyProps(),
    'Load Items Success': props<{ items: YourDto[] }>(),
    'Load Items Failure': props<{ error: string }>(),

    'Load Item': props<{ id: string }>(),
    'Load Item Success': props<{ item: YourDto }>(),
    'Load Item Failure': props<{ error: string }>(),

    // Command actions (payload for POST/PUT/PATCH/DELETE)
    'Add Item': props<{ item: Omit<YourDto, 'id'> }>(),
    'Add Item Success': props<{ item: YourDto }>(),
    'Add Item Failure': props<{ error: string }>(),

    'Update Item': props<{ item: YourDto }>(),
    'Update Item Success': props<{ item: YourDto }>(),
    'Update Item Failure': props<{ error: string }>(),

    'Delete Item': props<{ id: string }>(),
    'Delete Item Success': props<{ id: string }>(),
    'Delete Item Failure': props<{ error: string }>(),

    // UI actions
    'Clear Error': emptyProps(),
    'Set Selected Item': props<{ item: YourDto | null }>(),
  },
});
```

## 3. Selectors File (`[name].selectors.ts`)

```typescript
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { [Name]State } from './[name].state';

export const select[Name]State = createFeatureSelector<[Name]State>('[name]');

export const selectItems = createSelector(
  select[Name]State,
  (state) => state.items
);

export const selectSelectedItem = createSelector(
  select[Name]State,
  (state) => state.selectedItem
);

export const selectLoading = createSelector(
  select[Name]State,
  (state) => state.loading
);

export const selectError = createSelector(
  select[Name]State,
  (state) => state.error
);

// Computed selectors
export const selectHasItems = createSelector(
  selectItems,
  (items) => items.length > 0
);
```

## 4. Effects File (`[name].effects.ts`)

```typescript
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { YourService } from '../../services/your.service';
import { [Name]Actions } from './[name].actions';

@Injectable()
export class [Name]Effects {
  private actions$ = inject(Actions);
  private yourService = inject(YourService);

  loadItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType([Name]Actions.loadItems),
      switchMap(() =>
        this.yourService.getItems().pipe(
          map((items) => [Name]Actions.loadItemsSuccess({ items })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to load items';
            return of([Name]Actions.loadItemsFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // For actions with payload, use switchMap with destructured payload
  addItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType([Name]Actions.addItem),
      switchMap(({ item }) =>
        this.yourService.createItem(item).pipe(
          map((newItem) => [Name]Actions.addItemSuccess({ item: newItem })),
          catchError((error) => {
            const errorMessage = error.error?.message || error.message || 'Failed to add item';
            return of([Name]Actions.addItemFailure({ error: errorMessage }));
          })
        )
      )
    )
  );
}
```

## 5. Barrel Export (`index.ts`)

```typescript
export * from './[name].actions';
export * from './[name].state';
export * from './[name].selectors';
export * from './[name].effects';
```

## 6. Facade Pattern

Facades provide a **simplified API** between components and the NgRx store. Components should **never interact with the store directly** — they always go through a facade.

### Responsibilities

| Layer | Responsibility |
| --- | --- |
| **Service** (`*.service.ts`) | HTTP calls to backend API only |
| **Store** (actions, effects, reducers) | State management and side effects |
| **Facade** (`*.facade.ts`) | Exposes state as observables, exposes actions as methods |

### Creating a Facade

```typescript
import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  [Name]Actions,
  selectItems,
  selectSelectedItem,
  selectLoading,
  selectError,
} from '../store/[name]';

@Injectable({ providedIn: 'root' })
export class [Name]Facade {
  private store = inject(Store);

  // ─── State Selectors (read-only observables) ────────────────────────────

  items$: Observable<YourDto[]> = this.store.select(selectItems);
  selectedItem$: Observable<YourDto | null> = this.store.select(selectSelectedItem);
  loading$: Observable<boolean> = this.store.select(selectLoading);
  error$: Observable<string | null> = this.store.select(selectError);

  // ─── Actions (dispatch to store) ─────────────────────────────────────────

  loadItems(): void {
    this.store.dispatch([Name]Actions.loadItems());
  }

  addItem(item: Omit<YourDto, 'id'>): void {
    this.store.dispatch([Name]Actions.addItem({ item }));
  }

  // ─── Convenience Methods ────────────────────────────────────────────────

  selectItem(item: YourDto): void {
    this.store.dispatch([Name]Actions.setSelectedItem({ item }));
  }

  clearError(): void {
    this.store.dispatch([Name]Actions.clearError());
  }
}
```

### Facade Design Guidelines

1. **Expose selectors as observables** — use `$` suffix convention (e.g., `items$`, `loading$`)
2. **Expose actions as methods** — components call `facade.loadItems()` not `store.dispatch()`
3. **Group related operations** — if a component needs related data, add a convenience method
4. **Avoid subscribing in facades** — let components subscribe to observables
5. **Keep services thin** — HTTP only, no business logic in services

### Using a Facade in a Component

```typescript
@Component({ ... })
export class ItemListComponent {
  private facade = inject(ItemFacade);

  // Use observables directly in template with async pipe
  items$ = this.facade.items$;
  loading$ = this.facade.loading$;

  loadItems(): void {
    this.facade.loadItems();
  }

  selectItem(item: YourDto): void {
    this.facade.selectItem(item);
  }
}
```

### Existing Facades

- [auth.facade.ts](src/app/services/auth.facade.ts) — authentication state and operations
- [games.facade.ts](src/app/services/games.facade.ts) — game CRUD and selection

## 7. Register in App Config

In `app.config.ts`:

```typescript
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { [name]Reducer } from './store/[name]/[name].state';
import { [Name]Effects } from './store/[name]/[name].effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({ ['name']: [name]Reducer }),
    provideEffects([Name]Effects]),
    // ... other providers
  ],
};
```

## Reference Implementation

See the [game store](src/app/store/game/) for a complete working example with all CRUD operations, pagination, and error handling.
