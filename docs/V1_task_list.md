# V1 Implementation Task List

> Reference: [V1 Implementation Plan](./V1-IMPLEMENTATION-PLAN.md)
> Last Updated: 2026-04-18

## Clarifications (from user)
- **Starting gold**: 10,000 gold + 100 gems
- **Job timing**: Global tick (all places refresh simultaneously)
- **Vehicle upgrades**: NOT in V1 - fixed 1 engine, 0 aux cars
- **Task style**: Atomic tasks (one feature per session)

## Notes
- on all section X.Y you have to implement unit tests for the added functionality, and run the whole suite of tests to verify the rest of the app still works
- on all added services and code, add documentation both at method level and on important blocks of code. the documentation should make it clear to the viewer what the code does.
- after implementing each step inside a section, mark it as complete

---

## Phase 1: Foundation Services

### 1.1 SchedulerService
- [x] Create `server/src/app/game/scheduler/scheduler.interface.ts` - Abstract interface
- [x] Create `server/src/app/game/scheduler/in-memory-scheduler.service.ts` - setTimeout implementation
- [x] Write basic test to verify scheduling works

### 1.2 GameClockService
- [x] Create `server/src/app/game/game-clock/game-clock.service.ts`
- [x] Implement `getGameTime()`, `syncWithWallClock()`
- [x] Note: `pause()`, `resume()`, `setSpeed()` are future features
- [x] Write basic unit tests to verify game clock service works correctly

---

## Phase 2: Entity Modifications

### 2.1 Place Entity - Add Price Fields
- [x] Add `priceGold` field to Place entity (default: 1000)
- [x] Add `priceGems` field to Place entity (default: 0)
- [x] Add to `server/src/app/api/places.module.ts`

### 2.2 Vehicle Entity - Add Price and Fuel Fields
- [x] Add `priceGold` field
- [x] Add `priceGems` field
- [x] Add `fuelBaseBurn` field (base fuel consumption per distance)
- [x] Add `fuelPerLoadBurn` field (additional fuel per cargo unit)
- [x] Add to `server/src/app/api/vehicles.module.ts`

### 2.3 VehicleInstance Entity - Refactor for Movement
- [x] Rename `start` → `currentPlaceInstance` (PlaceInstance reference)
- [x] Rename `end` → `destinationPlaceInstance` (PlaceInstance reference)
- [x] Add `route: ObjectId[]` for multi-stop routes
- [x] Add `status: 'AT_PLACE' | 'IN_TRANSIT'`
- [x] Note: `content.upgrades` NOT in V1 (fixed 1 engine, 0 aux cars)
- [x] Update in `server/src/app/api/vehicle-instances.module.ts`

### 2.4 Job Entity - Add Cargo Type and Flexible Location
- [x] Add `cargoType: string` field ('Coal', 'Grain', 'Electronics', etc.)
- [x] Add `load: number` field (already exists - verify)
- [x] Add `pay: number` field (already exists - verify)
- [x] Add `payType: 'GOLD' | 'GEMS'` (already exists - verify)
- [x] Add `startPlaceId: ObjectId` (template Place origin)
- [x] Add `endPlaceId: ObjectId` (template Place destination)
- [x] Add `placeInstanceId: ObjectId` (warehoused at this PlaceInstance)
- [x] Add `vehicleInstanceId: ObjectId` (loaded on this VehicleInstance)
- [x] Update in `server/src/app/api/jobs.module.ts`

### 2.5 CargoType Enum
- [x] Define `CargoTypes` constant array in `server/src/app/api/vehicles.module.ts`
- [x] Export `CargoType` type

---

## Phase 3: Game Services

### 3.1 EconomyService
- [ ] Create `server/src/app/game/economy/economy.service.ts`
- [ ] Implement `creditPlayer()` - add gold/gems to wallet
- [ ] Implement `debitPlayer()` - deduct gold/gems from wallet
- [ ] Log transactions via TransactionService

### 3.2 MapRevealService
- [ ] Create `server/src/app/game/map-reveal/map-reveal.service.ts`
- [ ] Implement `getOwnedPlaceInstances(playerId)` - get player's places
- [ ] Implement `getAvailablePlaces(playerId)` - places 1 hop from owned
- [ ] Implement map visibility algorithm (see V1 plan lines 432-465)

### 3.3 PlacePurchaseService
- [ ] Create `server/src/app/game/place-purchase/place-purchase.service.ts`
- [ ] Implement `purchasePlace()` - validate affordability, deduct, create PlaceInstance
- [ ] Create `place-purchase.controller.ts`
- [ ] Create `POST /players/:id/purchase-place` endpoint

### 3.4 JobOfferService
- [ ] Create `server/src/app/game/job-offer/job-offer.service.ts`
- [ ] Implement `generateOffersForPlace()` - only when player has 2+ places
- [ ] Implement `generateRandomJob()` - random cargo type, load, pay
- [ ] Implement global tick refresh (all places at same interval)
- [ ] Create `job-offer.controller.ts`

### 3.5 VehicleDispatchService
- [ ] Create `server/src/app/game/vehicle-dispatch/vehicle-dispatch.service.ts`
- [ ] Implement `dispatch()` - validate route, calculate travel time, schedule arrival
- [ ] Implement route validation algorithm (V1 plan lines 1022-1044)
- [ ] Implement travel time calculation (V1 plan lines 1047-1090)
- [ ] Implement `processArrival()` handler - deliver jobs, update position
- [ ] Implement multi-stop handling (continue to next stop or end journey)
- [ ] Create `vehicle-dispatch.controller.ts`

---

## Phase 4: Player Initialization Flow

### 4.1 Starting Resources Change
- [ ] Modify `web/app/pages/Games.tsx` line ~91: 100 gold → 10,000 gold
- [ ] Add 100 gems to starting wallet

### 4.2 Join Flow Modification
- [ ] After player creation, redirect to "Select Starting Place" page
- [ ] Modify `Games.tsx` `handleSave()` to redirect

### 4.3 Select Starting Place Page
- [ ] Create `web/app/pages/SelectStartingPlace.tsx`
- [ ] Display available Places from game's template
- [ ] Create `POST /players/:id/select-starting-place` endpoint
- [ ] On selection: create PlaceInstance, create starter VehicleInstance, set wallet

### 4.4 Starter Vehicle
- [ ] Determine: Is there a "starter" vehicle template, or always level 1 locomotive?
- [ ] Create VehicleInstance at selected PlaceInstance
- [ ] Set `status: 'AT_PLACE'`, `currentPlaceInstance` to new PlaceInstance

---

## Phase 5: Core API Endpoints

### 5.1 Map View Endpoints
- [ ] Create `GET /players/:id/map-view` endpoint
- [ ] Return: owned places (with jobOffers), available places (with prices), connections
- [ ] Create `GET /players/:id/available-places` endpoint (dedicated endpoint for available places only)
- [ ] Uses MapRevealService
- [ ] Uses MapRevealService

### 5.2 Job Endpoints
- [ ] `GET /place-instances/:id/jobs` - get job offers at owned place
- [ ] `POST /place-instances/:id/accept-job` - accept offer → creates Job entity
- [ ] `POST /place-instances/:id/warehouse-job` - leave job at place

### 5.3 Vehicle Job Endpoints
- [ ] `POST /vehicles/:id/load-job` - load job from place into vehicle
- [ ] `POST /vehicles/:id/unload-job` - unload job at current place
- [ ] `POST /vehicles/:id/dispatch` - dispatch with route

### 5.4 Job Details
- [ ] `GET /jobs/:id` - get job details

---

## Phase 6: Frontend Game View

### 6.1 Main Game Page
- [ ] Create `web/app/pages/Game.tsx` - main player game view
- [ ] Integrate with PlayerMapView component

### 6.2 Map Components
- [ ] `PlayerMapView` - main map with owned (colored) + available (grayed) places
- [ ] `PlaceMarker` - different styles for owned vs available
- [ ] `RoutePickerOverlay` - click on map to form route

### 6.3 UI Panels
- [ ] `BuyPlaceModal` - dialog for purchasing available places
- [ ] `JobBoard` - show available jobs at selected owned place
- [ ] `VehicleDispatchPanel` - select vehicle, pick route, dispatch

### 6.4 Sidebar/Display
- [ ] `OwnedPlacesList` - sidebar list of player's places
- [ ] `WalletDisplay` - already exists (verify integration)

---

## Phase 7: Integration & Polish

### 7.1 Vehicle Position on Map
- [ ] Show moving vehicles on map (interpolate position between stops)
- [ ] Use short tick (1-2s) for visual updates

### 7.2 Error Handling
- [ ] Add validation errors for all endpoints
- [ ] Display errors in frontend modals/toasts

### 7.3 Integration Testing
- [ ] Test full flow: join game → select place → buy place → accept job → dispatch → deliver

---

## Task Dependencies

```
Phase 1 (Foundation)
  └─ 1.1 SchedulerService
  └─ 1.2 GameClockService

Phase 2 (Entities) - parallel work possible
  ├─ 2.1 Place price fields
  ├─ 2.2 Vehicle price/fuel fields
  ├─ 2.3 VehicleInstance refactor
  ├─ 2.4 Job cargo type
  └─ 2.5 CargoType enum

Phase 3 (Services) - depends on Phase 1 & 2
  ├─ 3.1 EconomyService
  ├─ 3.2 MapRevealService
  ├─ 3.3 PlacePurchaseService
  ├─ 3.4 JobOfferService
  └─ 3.5 VehicleDispatchService

Phase 4 (Player Init) - depends on Phase 2 & 3
  ├─ 4.1 Starting resources
  ├─ 4.2 Join flow modification
  ├─ 4.3 SelectStartingPlace page
  └─ 4.4 Starter vehicle

Phase 5 (API Endpoints) - depends on Phase 3
  ├─ 5.1 Map view endpoint
  ├─ 5.2 Job endpoints
  ├─ 5.3 Vehicle job endpoints
  └─ 5.4 Job details

Phase 6 (Frontend) - depends on Phase 5
  ├─ 6.1 Main Game page
  ├─ 6.2 Map components
  ├─ 6.3 UI panels
  └─ 6.4 Sidebar/display

Phase 7 (Polish) - depends on Phase 6
  ├─ 7.1 Vehicle animation
  ├─ 7.2 Error handling
  └─ 7.3 Integration testing
```

---

## Notes

- **Breaking change**: VehicleInstance refactor (Phase 2.3) requires data migration for existing games
- **Test with small map**: Use 5-10 places first before scaling
- **Redis swap**: Scheduler interface allows swapping to Bull later without changing business logic
