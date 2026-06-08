# CLAUDE.md - ng-web

Angular 19+ frontend application using NgRx for state management.

## Project Overview

ng-web is the Angular implementation of the Trains game frontend, built with:
- **Angular 19** with standalone components
- **NgRx** (Store, Effects, Entity) for state management
- **RxJS** for reactive data flows

## Architecture

### State Management Pattern

All data slices follow the same NgRx pattern with 4 files:

| File | Purpose |
|------|---------|
| `[name].state.ts` | Interface defining the state shape + reducer |
| `[name].actions.ts` | NgRx action group using `createActionGroup` |
| `[name].selectors.ts` | Memoized selectors using `createFeatureSelector` |
| `[name].effects.ts` | Side effects handling async operations |

The store module is registered in `app.config.ts`.

See [STORE.md](STORE.md) for detailed implementation guidelines.

### Services & Facades

- **Services** (`*.service.ts`) - Angular services that make HTTP calls to the backend API
- **Facades** (`*.facade.ts`) - Thin wrappers around the NgRx store that expose selectors as observables and actions as methods. Components use facades, never the store directly.

Example: [services/games.facade.ts](src/app/services/games.facade.ts)

### Directory Structure

```
src/app/
├── store/           # NgRx store modules (one subfolder per data slice)
│   └── game/        # Game slice (state, actions, selectors, effects)
├── services/       # Angular services (HTTP)
├── pages/          # Page components
├── components/     # Shared components
└── models/         # TypeScript interfaces/DTOs
```

## Key Conventions

- Use `createActionGroup` for actions (groups related actions by feature)
- Use `createFeatureSelector` for feature state selectors
- Effects use `switchMap` for idempotent operations (GET)
- Use `inject()` function for dependency injection (not constructor injection)
- Facades expose both selectors (as `$` observables) and action dispatchers (as methods)

## External Resources

- [React Web Implementation](../web/) - The React frontend (also serves as reference for domain models and API design)