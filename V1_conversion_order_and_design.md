# V1: TypeORM to Mongoose Migration - Conversion Order and Design

## Overview

This document outlines the migration strategy for converting all TypeORM entities to Mongoose, using the `AbstractMongoService` and `AbstractMongoServiceController` pattern established with the `Game` entity.

## Current State

| Entity | Module | Storage | Status |
|--------|--------|---------|--------|
| Game | games.module.ts | Mongoose | **Converted** |
| Job | jobs.module.ts | TypeORM | Pending |
| Place | places.module.ts | Mongoose | **Converted** |
| PlaceConnection | place-connection.module.ts | Mongoose | **Converted** |
| PlaceInstance | place-instance.module.ts | TypeORM | Pending |
| Vehicle | vehicles.module.ts | TypeORM | Pending |
| VehicleInstance | vehicle-instances.module.ts | TypeORM | Pending |
| Player | support/players.module.ts | TypeORM | Pending |
| Transaction | support/transactions.module.ts | Mongoose | **Converted** |
| User | support/users.module.ts | Mongoose | **Converted** |
| VehicleType | vehicle-types.module.ts | MockRepository | **Skip** (no DB) |
| PlaceType | place-type.module.ts | MockRepository | **Skip** (no DB) |

---

## Entity Relationship Map

```
Game (converted)
  ├── Place (converted) - gameId FK
  ├── PlaceConnection (converted) - gameId FK
  ├── Vehicle (pending) - gameId FK
  └── Player (pending) - gameId FK, userId FK
       ├── PlaceInstance (pending) - playerId FK, gameId FK
       │    └── jobOffers: JobOffer[] (embedded, not entity)
       └── VehicleInstance (pending) - playerId FK, gameId FK, vehicleId FK
            └── route: ObjectId[] (PlaceInstance IDs)

Transaction (pending) - entityId FK, entityType FK (generic relation)

User (converted) - standalone, no entity dependencies
```

---

## Conversion Order

### Rationale

Entities are ordered by **dependency count** (ascending) - entities with fewer dependencies on other pending entities should be converted first.

### Phase 1: Independent Entities (No dependencies on other TypeORM entities)

| Order | Entity | Rationale |
|-------|--------|-----------|
| 1 | **Transaction** | No entity dependencies. Only tracks generic entity references. ✅ **Converted** |
| 2 | **User** | No entity dependencies. Standalone authentication entity. ✅ **Converted** |

### Phase 2: Entities Depending Only on Converted Entities

| Order | Entity | Rationale |
|-------|--------|-----------|
| 3 | **Place** | Depends only on `Game` (already Mongoose). ✅ **Converted** |
| 4 | **PlaceConnection** | Depends only on `Game`. Uses raw ObjectIds, not relations. ✅ **Converted** |
| 5 | **Vehicle** | Depends only on `Game`. |

### Phase 3: Entities Depending on Phase 1-2 Entities

| Order | Entity | Rationale |
|-------|--------|-----------|
| 6 | **Player** | Depends on `User` (Phase 1) and `Game`. Has embedded `wallet` JSON. |

### Phase 4: Entities Depending on Phase 1-3 Entities

| Order | Entity | Rationale |
|-------|--------|-----------|
| 7 | **PlaceInstance** | Depends on `Player` and `Place` (both by Phase 3). Contains embedded `jobOffers[]` array. |
| 8 | **VehicleInstance** | Depends on `Player`, `Vehicle`, `PlaceInstance`. Contains `route: ObjectId[]` array. |

### Phase 5: Entities Depending on Phase 4 Entities

| Order | Entity | Rationale |
|-------|--------|-----------|
| 9 | **Job** | Depends on `PlaceInstance` and `VehicleInstance` (both Phase 4). Has ManyToOne relations plus raw ObjectId columns. |

---

## Per-Entity Conversion Checklist

### General Steps for Each Entity

1. **Create new Mongoose schema** extending `AbstractMongoEntity`
2. **Replace TypeORM decorators** (`@Entity`, `@Column`, `@ManyToOne`, etc.) with Mongoose decorators (`@Schema`, `@Prop`)
3. **Update service** to extend `AbstractMongoService<T>`
4. **Update controller** to extend `AbstractMongoServiceController<T, Dto>`
5. **Update mapper** to extend `AbstractMongoDtoMapper<T, Dto>`
6. **Update module** to use `MongooseModule.forFeature([...])` instead of `TypeOrmModule.forFeature([...])`
7. **Fix import paths** - use relative imports, not `src/` prefix
8. **Update entity references** in dependent modules

---

### Entity-Specific Notes

#### 1. Transaction (Phase 1)

**File:** `server/src/app/api/support/transactions.module.ts`

- [ ] Simple entity, no relations to other entities being migrated
- [ ] Has `entityType` and `entityId` which are generic references
- [ ] Uses `@CreateDateColumn`, `@UpdateDateColumn` - replace with service-layer timestamps

**Schema design:**
```typescript
@Schema({ collection: 'transactions' })
export class Transaction extends AbstractMongoEntity {
  @Prop()
  playerId: Types.ObjectId;

  @Prop()
  type: TransactionType;

  @Prop()
  entityType: string;  // 'USER' | 'PLAYER' | etc.

  @Prop()
  entityId: Types.ObjectId;

  @Prop()
  currency: string;

  @Prop()
  amount: number;

  @Prop()
  balance: number;

  @Prop()
  description: string;
}
```

#### 2. User (Phase 1)

**File:** `server/src/app/api/support/users.module.ts`

- [ ] Standalone entity
- [ ] Has embedded `wallet: Wallet` JSON object
- [ ] Has embedded `preferences: object`
- [ ] Custom controller (does NOT extend AbstractServiceController) - may need to adapt

**Schema design:**
```typescript
@Schema({ collection: 'users' })
export class User extends AbstractMongoEntity {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  name: string;

  @Prop({ type: Object })
  wallet: { gold: number; gems: number; parts: number; content: object };

  @Prop({ type: Object })
  preferences: object;

  @Prop()
  role: string;
}
```

#### 3. Place (Phase 2)

**File:** `server/src/app/api/places.module.ts`

- [ ] Depends only on `Game`
- [ ] Custom endpoints: `GET /places/game/:gameId`, `POST /places/copy`, `DELETE /places/game/:gameId`
- [ ] Uses `@CreateDateColumn`, `@UpdateDateColumn`

**Schema design:**
```typescript
@Schema({ collection: 'places' })
export class Place extends AbstractMongoEntity {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  type: string;

  @Prop()
  x: number;

  @Prop()
  y: number;

  @Prop({ type: Object })
  content: object;

  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  gameId: Types.ObjectId;
}
```

#### 4. PlaceConnection (Phase 2)

**File:** `server/src/app/api/place-connection.module.ts`

- [ ] Depends only on `Game`
- [ ] Uses raw ObjectId columns (`startId`, `endId`) not TypeORM relations
- [ ] Has `route: object[]` array for polyline points

**Schema design:**
```typescript
@Schema({ collection: 'place-connections' })
export class PlaceConnection extends AbstractMongoEntity {
  @Prop({ type: Types.ObjectId, ref: 'Place', required: true })
  startId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Place', required: true })
  endId: Types.ObjectId;

  @Prop()
  type: string;  // 'ROAD' | 'RAIL' | etc.

  @Prop({ type: Object })
  route: object[];  // Array of {x, y} points

  @Prop()
  distance: number;

  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  gameId: Types.ObjectId;
}
```

#### 5. Vehicle (Phase 2)

**File:** `server/src/app/api/vehicles.module.ts`

- [ ] Depends only on `Game`
- [ ] Has `content: object` for extended data

**Schema design:**
```typescript
@Schema({ collection: 'vehicles' })
export class Vehicle extends AbstractMongoEntity {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  type: string;

  @Prop()
  speed: number;

  @Prop()
  range: number;

  @Prop()
  fuelCapacity: number;

  @Prop()
  cargoCapacity: number;

  @Prop({ type: Object })
  content: object;

  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  gameId: Types.ObjectId;
}
```

#### 6. Player (Phase 3)

**File:** `server/src/app/api/support/players.module.ts`

- [ ] Depends on `User` and `Game`
- [ ] Has embedded `wallet: { gold, gems, parts, content }` JSON
- [ ] Has `content: object` for extended data
- [ ] Complex controller with many custom endpoints

**Schema design:**
```typescript
@Schema({ collection: 'players' })
export class Player extends AbstractMongoEntity {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  gameId: Types.ObjectId;

  @Prop({ type: Object })
  wallet: { gold: number; gems: number; parts: number; content: object };

  @Prop({ type: Object })
  content: object;
}
```

#### 7. PlaceInstance (Phase 4)

**File:** `server/src/app/api/place-instance.module.ts`

- [ ] Depends on `Player` and `Place`
- [ ] Contains embedded `jobOffers: JobOffer[]` array - NOT a separate entity
- [ ] Custom endpoints: `GET /by-player/:playerId`, `GET /:id/jobs`, `POST /:id/accept-job`, `POST /:id/warehouse-job`

**Schema design:**
```typescript
// JobOffer is embedded, not a separate collection
@Schema({ collection: 'place-instances' })
export class PlaceInstance extends AbstractMongoEntity {
  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  playerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Place', required: true })
  placeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  gameId: Types.ObjectId;

  @Prop({ type: Object })
  jobOffers: JobOffer[];  // Embedded array

  @Prop({ type: Object })
  content: object;
}

// Define JobOffer as a plain interface (not a schema)
export interface JobOffer {
  id: string;
  name: string;
  cargoType: string;
  load: number;
  pay: number;
  payType: string;
  startTime: Date;
  endTime?: Date;
  // ... other fields
}
```

#### 8. VehicleInstance (Phase 4)

**File:** `server/src/app/api/vehicle-instances.module.ts`

- [ ] Depends on `Player`, `Vehicle`, `PlaceInstance`
- [ ] Contains `route: Types.ObjectId[]` array of PlaceInstance IDs
- [ ] Has `currentPlaceInstance`, `destinationPlaceInstance` references
- [ ] Custom endpoints: `GET /by-player/:playerId`, `POST /:id/load-job`, `POST /:id/unload-job`

**Schema design:**
```typescript
@Schema({ collection: 'vehicle-instances' })
export class VehicleInstance extends AbstractMongoEntity {
  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  playerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  gameId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PlaceInstance' })
  currentPlaceInstanceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PlaceInstance' })
  destinationPlaceInstanceId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'PlaceInstance' })
  route: Types.ObjectId[];

  @Prop()
  fuel: number;

  @Prop()
  cargo: number;

  @Prop({ type: Object })
  content: object;
}
```

#### 9. Job (Phase 5)

**File:** `server/src/app/api/jobs.module.ts`

- [ ] Depends on `PlaceInstance` and `VehicleInstance`
- [ ] Has ManyToOne relations (`start`, `end`) PLUS raw ObjectId columns
- [ ] Uses `@ManyToOne` with eager loading for `start` and `end` Place relations
- [ ] Has `type: JobType` enum (`PLACE` | `VEHICLE` | `TRANSIT`)

**Schema design:**
```typescript
@Schema({ collection: 'jobs' })
export class Job extends AbstractMongoEntity {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  type: JobType;  // 'PLACE' | 'VEHICLE' | 'TRANSIT'

  @Prop()
  cargoType: string;

  @Prop()
  load: number;

  @Prop()
  pay: number;

  @Prop()
  payType: string;

  @Prop()
  startTime: Date;

  // Raw ObjectId columns (not TypeORM relations)
  @Prop({ type: Types.ObjectId, ref: 'PlaceInstance' })
  placeInstanceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'VehicleInstance' })
  vehicleInstanceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Place' })
  startPlaceId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Place' })
  endPlaceId: Types.ObjectId;

  @Prop({ type: Object })
  content: object;
}
```

---

## Special Considerations

### 1. Circular Dependencies

**JobsModule** uses `forwardRef(() => PlaceInstancesModule)` due to `JobMapper` injecting `PlaceInstancesService`.

When converting, consider:
- Keep the circular dependency if needed for cross-referencing services
- Or refactor to break the cycle by moving shared logic to a separate service

### 2. Custom Controllers

- **UsersModule** has a custom controller not extending `AbstractServiceController`
- **AdminUsersModule** has `handlePagedResultsEnriched` custom method
- May need adapter pattern or custom implementation

### 3. Embedded Arrays vs Separate Collections

- `PlaceInstance.jobOffers[]` - embedded array (not a separate entity)
- `VehicleInstance.route[]` - array of ObjectIds (can be stored as ObjectId refs)

### 4. Transaction Entity

Uses generic entity references (`entityType`, `entityId`). These should remain as raw ObjectId references without strict typing since they can point to multiple entity types.

### 5. Enums

Migrate TypeORM enums to TypeScript enums or const objects. Example:
```typescript
// Before (TypeORM)
@Column({ type: 'enum', enum: JobType })
type: JobType;

// After (Mongoose)
@Prop({ type: String, enum: ['PLACE', 'VEHICLE', 'TRANSIT'] })
type: string;  // or use TypeScript enum
```

---

## Testing Strategy

For each entity converted:

1. **Unit tests** - Test service methods directly with mocked model
2. **Integration tests** - Test full endpoint with actual MongoDB (or testcontainers)
3. **Verify backward compatibility** - Ensure existing clients still work

### Unit Test Requirements

For each entity migrated to Mongoose:

1. **Service unit tests** - Mock the Mongoose model. Test all public service methods, especially:
   - Custom methods (e.g., `findAllByEntityId`, `findAllByPlayerId`, `createTransaction`)
   - Standard CRUD methods inherited from `AbstractMongoService` to ensure they work correctly

2. **Controller unit tests** - Mock the service and mapper. Test all endpoints, especially:
   - Custom endpoints (e.g., `GET /by-player/:playerId`, `GET /by-entity/:entityId/:entityType`)
   - Standard CRUD endpoints inherited from `AbstractMongoServiceController`

3. **Workflow after converting an entity:**
   - Write unit tests for service and controller
   - Run tests and verify all pass
   - Run `npm run build` to ensure compilation still works
   - Only then proceed to next entity

4. **Test file naming:** `*.spec.ts` alongside the module file (e.g., `transactions.service.spec.ts`, `transactions.controller.spec.ts`)

### Rollback Plan

If issues arise during migration:

1. Keep TypeORM module commented out but NOT deleted
2. Use feature flags to switch between TypeORM and Mongoose implementations
3. Test each entity conversion independently before proceeding

---

## Dependencies Summary

```
Game ──────────────── CONVERTED
  │
  ├── Place ────────── Phase 2
  ├── PlaceConnection ─ Phase 2
  └── Vehicle ───────── Phase 2

User ──────────────── Phase 1 (independent)
  └── Player ───────── Phase 3

Transaction ───────── Phase 1 (independent)

Player ────────────── Phase 3
  ├── PlaceInstance ─── Phase 4
  └── VehicleInstance ─ Phase 4

PlaceInstance ──────── Phase 4
  └── Job ──────────── Phase 5

VehicleInstance ───── Phase 4
  └── Job ──────────── Phase 5
```
