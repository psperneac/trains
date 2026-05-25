# Real-time WebSocket Architecture Plan

## Context

Replace polling with Socket.IO push. Server broadcasts job updates every 5 min. Clients subscribe to their game's room, receive full state on connect/reconnect, and get push updates for job offers and vehicle state changes. Write operations use optimistic concurrency to detect stale client state.

---

## 1. Socket.IO Gateway

**Files to create:**
- `server/src/app/game/events-gateway/events-gateway.ts` — Socket.IO gateway with `@WebSocketGateway('/game')`
- `server/src/app/game/events-gateway/events-gateway.module.ts` — Gateway module

**Behavior:**
- Auth: validate JWT from handshake `auth.token` query param on `handleConnection`
- Reject connections with invalid/missing tokens, emit `error` event
- Rooms: `game:{gameId}` for all game clients; `player:{playerId}` for vehicle state (only player's vehicles)

**Client → Server events:**
| Event | Payload | Action |
|---|---|---|
| `subscribe` | `{ gameId, playerId }` | Join `game:{gameId}` + `player:{playerId}` |
| `unsubscribe` | `{ gameId, playerId }` | Leave rooms |
| `requestFullSync` | `{ gameId, playerId }` | Respond with `fullSync` |

**Server → Client events:**
| Event | Payload | Description |
|---|---|---|
| `jobOffersUpdated` | `{ placeId, jobOffers[] }` | New/changed job offers |
| `vehicleStateUpdated` | `{ vehicleId, vehicle }` | Player's vehicle state changed |
| `fullSync` | `{ jobOffers: {[placeId]: JobOffer[]}, vehicles: {[vehicleId]: Vehicle} }` | Full state on connect/reconnect |
| `error` | `{ message }` | Auth or connection error |

---

## 2. Scheduler — Broadcast on Job Refresh

**File:** `server/src/app/game/job-offer/job-offer.service.ts` (existing)

Modify `refreshAllOffers()` to broadcast after generating offers:

```
for each placeInstance:
  await generateOffersForPlace(placeInstance._id)
  emit jobOffersUpdated → room game:{gameId}
```

Broadcast via `EventsGateway` injected into `JobOfferService`.

**Admin override:**
- `POST /games/:gameId/refresh-jobs` — calls `refreshAllOffers()` immediately and broadcasts
- Requires `Admin` guard

---

## 3. Vehicle State Broadcast

**When to emit `vehicleStateUpdated`:**
- Vehicle moves (sent to a place)
- Vehicle loads/unloads cargo
- Vehicle arrives at destination

These events already exist in `VehicleInstanceService`. Inject `EventsGateway` and emit after each mutation for the owner's room `player:{playerId}`.

---

## 4. Full State Sync on Reconnect

**`requestFullSync` handler:**

```typescript
async handleFullSync(client, payload: { gameId, playerId }) {
  // 1. Fetch all PlaceInstances for this game → build jobOffers map
  // 2. Fetch all VehicleInstances for this player → build vehicle map
  // 3. Emit `fullSync` to client only
}
```

This replaces the need for version tracking — each reconnect gets a full snapshot.

---

## 5. Conflict Detection on Write Operations

**Files to modify:** existing service methods that handle:
- `acceptJob` — pick a job from a PlaceInstance
- `warehouseJob` — store a job at a PlaceInstance
- `loadJob` — load cargo onto a vehicle
- `sendVehicle` — dispatch a vehicle to a place

**Mechanism — version field on entities:**

Add `version: number` to `PlaceInstance` and `VehicleInstance` schemas. Incremented on every mutation.

**Request flow:**
1. Client includes `expectedVersion` in request body
2. Service checks `if (entity.version !== expectedVersion) → throw ConflictException`
3. On conflict: `HttpStatus.CONFLICT` with `{ reason, currentVersion, currentEntity }`
4. Client receives 409 → dispatches `requestFullSync` → re-renders → user retries

**Updated service methods:**
- `acceptJob(placeInstanceId, jobOfferId, expectedVersion)`
- `loadJob(vehicleId, jobId, expectedVehicleVersion, expectedPlaceVersion)`

---

## 6. New Modules to Create

### `events-gateway.module.ts`
```typescript
@Module({
  imports: [AuthModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsGatewayModule {}
```

Import `EventsGatewayModule` in `GameModule`.

### `events-gateway.ts`
- `@WebSocketGateway('/game', { cors: { origin: '*' } })`
- `@WebSocketServer() server: Server`
- Inject `AuthService`, `SchedulerService` (for forced refresh), `PlaceInstancesService`, `VehicleInstancesService`
- Handle: `connection`, `disconnect`, `subscribe`, `unsubscribe`, `requestFullSync`

---

## 7. Data Model Changes

**`PlaceInstance` (existing entity):**
```typescript
@Prop({ default: 0 })
version: number;
```

**`VehicleInstance` (existing entity):**
```typescript
@Prop({ default: 0 })
version: number;
```

Increment on every update in the respective service.

---

## 8. REST Endpoint Changes

| Endpoint | Change |
|---|---|
| `POST /place-instances/:id/accept-job` | Add `expectedVersion` to body, return 409 on mismatch |
| `POST /place-instances/:id/warehouse-job` | Add `expectedVersion` to body, return 409 on mismatch |
| `PUT /vehicles/:id/load-job` | Add `expectedVehicleVersion` + `expectedPlaceVersion`, return 409 on mismatch |
| `POST /vehicles/:id/send` | Add `expectedVersion`, return 409 on mismatch |
| `POST /games/:gameId/refresh-jobs` | Admin-only, trigger immediate broadcast |

---

## 9. Client Side (Web) Changes

**New files:**
- `web/app/store/socket.ts` — Socket.IO client singleton, `connect()`, `disconnect()`, `on()`, `emit()`
- `web/app/hooks/useGameSocket.ts` — React hook for socket subscription

**Store changes:**
- On `jobOffersUpdated`: update `placeInstancesStore` with new offers for the place
- On `vehicleStateUpdated`: update `vehiclesStore` with new vehicle state
- On `fullSync`: replace all cached job offers and vehicle states

**Conflict handling:**
- On 409 from any write operation → dispatch `requestFullSync` → show "state changed, please retry" toast

**Connection lifecycle:**
- Connect on game page mount with JWT
- Disconnect on game page unmount
- Reconnect with exponential backoff

---

## 10. Implementation Order

- [x] 1. **Socket.IO server setup** — install `socket.io`, `@nestjs/platform-socket.io`, create `EventsGateway`
- [x] 2. **Data model updates** — add `version` to `PlaceInstance`, `VehicleInstance`, update services to increment
- [x] 3. **Conflict detection** — add `expectedVersion` checks to write operations, return 409
- [x] 4. **Vehicle state broadcast** — emit `vehicleStateUpdated` on vehicle mutations
- [x] 5. **Scheduler broadcast** — modify job refresh to emit `jobOffersUpdated` to game rooms
- [x] 6. **Full sync** — implement `requestFullSync` handler and `fullSync` emission
- [x] 7. **Admin endpoint** — `POST /games/:gameId/refresh-jobs`
- [x] 8. **Client socket client** — create `socket.ts` store, `useGameSocket` hook, wire up to existing stores
- [x] 9. **Conflict UI** — (deferred — needs 409 handling in client stores)

---

## 11. Files to Modify (Summary)

| File | Change |
|---|---|
| `server/src/app/game/job-offer/job-offer.service.ts` | Inject gateway, broadcast after refresh, add admin refresh |
| `server/src/app/api/place-instance.module.ts` | Add `version` field, conflict checks on write methods |
| `server/src/app/api/vehicle-instance.module.ts` | Add `version` field, conflict checks + emit vehicle updates |
| `server/src/app/game/vehicle-instance.service.ts` | Emit `vehicleStateUpdated` on mutations |
| `server/src/app/game/game.controller.ts` | Add admin force-refresh endpoint |
| `server/src/app/game/game.module.ts` | Import `EventsGatewayModule` |
| `server/package.json` | Add `socket.io`, `@nestjs/platform-socket.io` |
| `web/app/store/socket.ts` | New: Socket.IO client store |
| `web/app/hooks/useGameSocket.ts` | New: React hook |
| `web/app/store/placeInstancesStore.ts` | Handle `jobOffersUpdated` |
| `web/app/store/vehiclesStore.ts` | Handle `vehicleStateUpdated` |