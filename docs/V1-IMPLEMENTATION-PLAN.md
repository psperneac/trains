# V1 Implementation Plan - Trains Game

> **Status**: Draft for Review
> **Last Updated**: 2026-03-23

---

## Table of Contents

1. [Game Overview](#game-overview)
2. [Game Flow](#game-flow)
3. [Data Model Changes](#data-model-changes)
4. [New Services](#new-services)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Implementation Order](#implementation-order)
8. [Key Algorithms](#key-algorithms)
9. [Decision Log](#decision-log)

---

## Game Overview

### Entities and Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MULTI-TENANT ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────────────┘

  User (account - email/password)
    │
    │ 1:N (a user can have many players, one per game)
    │
    ▼
  Player (game-specific avatar)
    │─ belongs to 1 Game (tenant)
    │─ has 1 Wallet (gold, gems, parts)
    │─ owns many PlaceInstances
    │─ owns many VehicleInstances
    │─ owns many Jobs (active deliveries)
    │
    ▼
  Game (tenant - TEMPLATE or GAME type)
    │─ TEMPLATE: admin editable, used to create GAME instances
    │─ GAME: playable instance with Places, Connections, Vehicle templates
    │
    ▼
  ├── Place (template - station, warehouse, port, etc.)
  ├── PlaceConnection (routes between Places)
  ├── Vehicle (template - locomotive types with stats)
  └── (PlaceInstance, VehicleInstance, Job are player-owned copies)
```

### Key Relationships

| Entity | Description | Relationships |
|--------|-------------|---------------|
| **User** | User account (registers, logs in) | Has many Players |
| **Player** | User's avatar in a specific Game | Belongs to 1 Game, has Wallet, owns PlaceInstances, VehicleInstances |
| **Game** | Multi-tenant container (TEMPLATE or GAME) | Contains Place templates, PlaceConnections, Vehicle templates |
| **PlaceInstance** | Player-owned Place | Belongs to 1 Player, references 1 Place template |
| **VehicleInstance** | Player-owned Vehicle | Belongs to 1 Player, at 1 PlaceInstance or in transit |

### Existing Flow: User Joins Game

**Current Implementation** (already exists):

1. **Registration**: User creates account at `/register` with email/username/password
2. **Login**: User logs in at `/login`, receives JWT token
3. **Games Page** (`/games`):
   - User sees list of games with `type: GAME`
   - User clicks "Join Game" button on a game
   - Modal appears for player name/description
   - User clicks "Save" → Player is created
4. **Starting Resources** (currently): Player gets **100 gold, 0 gems, 0 parts**
5. **After Joining**: User is redirected to... (game view not yet implemented)

**API Endpoints Involved**:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/users` | POST | Register new user |
| `POST /api/auth/login` | POST | Login, returns JWT |
| `GET /api/games` | GET | List available games |
| `POST /api/players` | POST | Create player in a game (join) |
| `GET /api/players/by-user/:userId` | GET | Get user's players |

**Frontend Pages** (existing):
- `/login` - Login form
- `/register` - Registration form
- `/games` - List games and join

---

### Concept
A transportation economy game where players:
- Buy and own places (warehouses, stations, factories)
- Purchase vehicles to transport cargo
- Accept jobs to move goods between owned places
- Earn money to expand their network
- Progress by controlling more territory

### Core Loop
```
START → Buy First Place → Buy Vehicles → Accept Jobs → Dispatch → Deliver → Earn → Buy More Places → Repeat
```

### Time System
- **Approach**: Short ticks for visual updates + scheduled tasks for arrivals
- **Rationale**: Efficient resource use, exact timing for arrivals, easy to swap to Redis later
- Vehicles move in real-time but processing is event-driven, not constant polling

### Economy Model
- **Jobs**: Payment is attached to the job when accepted, delivered to player on completion
- **Payment adjustment**: Not in V1, but design allows for future time-based adjustments
- **Currency**: Gold and Gems

---

## Game Flow

### Phase 1: Game Start (After Joining Game)
*Assumes user has already registered, logged in, and clicked "Join Game" on the Games page.*

1. Player is redirected to "Select Starting Place" screen
2. Player sees list of available Places (from the Game's template Places)
3. Player selects 1 Place as their starting location (FREE - no cost)
4. System creates:
   - Player's first **PlaceInstance** (at the selected Place)
   - **Starter Vehicle** (level 1 locomotive) at that PlaceInstance
   - Player wallet set to **10,000 gold + 100 gems**
5. Player is now in "New Game" state - sees map with 1 owned place

**Changes to Existing Flow**:

| What | Current | V1 Change |
|------|---------|-----------|
| Join Game | Creates Player with 100 gold | Creates Player, then redirects to place selection |
| Starting money | 100 gold | 10,000 gold + 100 gems |
| Starting assets | None | 1 PlaceInstance + 1 VehicleInstance |
| After join | Redirects to games list | Redirects to "Select Starting Place" |

**New Endpoint**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/players/:id/select-starting-place` | POST | Choose starting Place → creates PlaceInstance + Vehicle + sets wallet |

### Phase 2: Expansion
1. Map displays:
   - **Owned places**: Full color, show jobs
   - **Grayed places**: 1 connection away from owned, can buy but no jobs
2. Player clicks grayed place → Purchase modal shows price
3. If player can afford → Place purchased, becomes PlaceInstance
4. Newly purchased place reveals NEW grayed places (connected to it)
5. Repeat until player has 2+ connected places

### Phase 3: Jobs System
1. Jobs menu enabled when player has 2+ connected places
2. At any owned Place X, player sees jobs:
   - Job = transport cargo FROM X TO another owned place Y
   - Job shows: cargo type, load amount, payment
3. Player accepts job → Job assigned to a vehicle at X
4. Multiple jobs can be on one vehicle if capacity allows

### Phase 4: Dispatch & Delivery
1. Player dispatches vehicle with loaded jobs
2. **Route Picker**: Player clicks on map to form route
   - Must start at vehicle's current location
   - Can include intermediate stops (for multi-stop routes)
   - Vehicle follows route sequentially
3. Vehicle travels → on arrival at each stop:
   - Jobs destined for that place are delivered
   - Payment credited to player wallet
   - Vehicle continues to next stop (if any)
4. At final destination, vehicle stops and is available for new jobs

### Phase 5: Progression
1. More deliveries → more money
2. More money → can buy more places
3. More places → more job routes available
4. Cycle continues

---

## Data Model Changes

### Existing Entities (Modified)

#### 1. Place - Add Price Fields
```typescript
// File: server/src/app/api/places.module.ts
// Add to Place entity:
@Column({ name: 'price_gold', default: 1000 })
@Expose()
priceGold: number;

@Column({ name: 'price_gems', default: 0 })
@Expose()
priceGems: number;
```

#### 2. Vehicle - Already Has Engine/Aux System
**Note**: Vehicle already has engine/aux fields. We only need to add price and fuel burn fields.

```typescript
// File: server/src/app/api/vehicles.module.ts
// Vehicle entity already has (confirmed by reading actual file):
// - type, name, description, content
// - engineMax: max engines (player upgrades from 1 to max)
// - engineLoad: cargo capacity per engine
// - engineFuel: fuel per engine
// - auxMax: max auxiliary cars
// - auxLoad: cargo per aux car
// - auxFuel: fuel per aux car
// - speed: speed
// ADD these fields:

@Column('int', { name: 'price_gold' })
@Expose()
priceGold: number;

@Column('int', { name: 'price_gems' })
@Expose()
priceGems: number;

@Column('int', { name: 'fuel_base_burn' })
@Expose()
fuelBaseBurn: number;  // Base fuel consumption per distance unit (when empty)

@Column('int', { name: 'fuel_per_load_burn' })
@Expose()
fuelPerLoadBurn: number;  // Additional fuel consumed per unit of cargo load
```

**Fuel Burn Calculation**:
```
fuelBurnRate = fuelBaseBurn + (totalLoad * fuelPerLoadBurn)
// Example: baseBurn=5, perLoadBurn=0.1, load=50 → burnRate = 5 + (50 * 0.1) = 10
```

**Upgrade System** (how it works):
- Player buys VehicleInstance (starts at 1 engine, 0 aux cars)
- Player can upgrade: add engines up to `engineMax`, add aux cars up to `auxMax`
- Total cargo capacity = `(engineLoad * currentEngines) + (auxLoad * currentAuxCars)`
- Total fuel capacity = `(engineFuel * currentEngines) + (auxFuel * currentAuxCars)`
- Upgrade costs are per-engine and per-aux-car (not in V1, just the template prices)

#### 3. VehicleInstance - Refactor for Movement
**Breaking Change**: `start` and `end` currently reference `Place` (template). They should reference `PlaceInstance` (player-owned).

```typescript
// File: server/src/app/api/vehicle-instances.module.ts
@Entity({ name: 'vehicle_instances' })
export class VehicleInstance extends AbstractEntity {
  @ManyToOne(_type => Vehicle, { eager: true })
  vehicle: Vehicle;

  // Changed: Was 'start' referencing Place
  @ManyToOne(_type => PlaceInstance, { eager: true, nullable: true })
  @JoinColumn({ name: 'current_place_instance_id' })
  currentPlaceInstance: PlaceInstance;  // Where vehicle is physically located

  // Changed: Was 'end' referencing Place  
  @ManyToOne(_type => PlaceInstance, { eager: true, nullable: true })
  @JoinColumn({ name: 'destination_place_instance_id' })
  destinationPlaceInstance: PlaceInstance;  // Where vehicle is heading

  // New field for multi-stop routes
  @Column('objectId', { array: true })
  route: ObjectId[];  // PlaceInstance IDs in journey order

  // New field for state tracking
  @Column('varchar', { length: 20 })
  status: 'AT_PLACE' | 'IN_TRANSIT';

  // Keep existing:
  @Column({ name: 'start_time' })
  startTime: Date;

  @Column({ name: 'end_time' })
  endTime: Date;

  @Column({ name: 'game_id' })
  gameId: string;

  @Column({ name: 'player_id' })
  playerId: string;

  @Column({ type: 'json' })
  content: any;  // Stores: { upgrades: { engines: number, auxCars: number } }
}
```

**Upgrade Storage**: Vehicle upgrades are stored in `content.upgrades`:
```typescript
content: {
  upgrades: {
    engines: 1,   // Current engine count (starts at 1)
    auxCars: 0    // Current aux car count (starts at 0)
  }
}

// Computed at runtime:
totalCargoCapacity = (vehicle.engineLoad * upgrades.engines) + (vehicle.auxLoad * upgrades.auxCars)
totalFuelCapacity = (vehicle.engineFuel * upgrades.engines) + (vehicle.auxFuel * upgrades.auxCars)
```

#### 4. Job - Add Cargo Type and Flexible Location
```typescript
// File: server/src/app/api/jobs.module.ts
// Add to Job entity:
@Entity({ name: 'jobs' })
export class Job extends AbstractEntity {
  @Column('varchar', { length: 50 })
  @Expose()
  cargoType: string;  // 'Coal', 'Grain', 'Electronics', etc.

  @Column({ name: 'load' })
  @Expose()
  load: number;  // Amount of cargo

  @Column({ name: 'pay' })
  @Expose()
  pay: number;

  @Column('varchar', { length: 10 })
  @Expose()
  payType: 'GOLD' | 'GEMS';

  // Job origin and destination (template Place IDs - never change)
  @Column('objectId')
  @Expose()
  startPlaceId: ObjectId;  // Template Place where job originates

  @Column('objectId')
  @Expose()
  endPlaceId: ObjectId;  // Template Place where job should be delivered

  // Current location - ONE of these is always set:
  @Column('objectId', { nullable: true })
  @Expose()
  placeInstanceId: ObjectId;  // Job is warehoused at this PlaceInstance

  @Column('objectId', { nullable: true })
  @Expose()
  vehicleInstanceId: ObjectId;  // Job is loaded on this VehicleInstance

  // Keep existing:
  @Column('varchar', { length: 20 })
  @Expose()
  type: 'PLACE' | 'VEHICLE';  // Storage type

  @Column({ name: 'game_id' })
  @Expose()
  gameId: string;

  @Column({ name: 'player_id' })
  @Expose()
  playerId: string;
}

// Helper function to get job location:
function getJobLocation(job: Job): 'PLACE' | 'VEHICLE' {
  if (job.vehicleInstanceId) return 'VEHICLE';
  if (job.placeInstanceId) return 'PLACE';
  return null; // Should not happen
}
```

#### 5. PlaceInstance - Already Has JobOffers
```typescript
// File: server/src/app/api/place-instance.module.ts
// Already has:
// - jobOffers: JobOffer[] (ephemeral, regenerates periodically)
// Minimal changes needed - just ensure relationship to player is clear
```

### New Entities/Interfaces

#### 6. JobOffer (Ephemeral DTO, Not Persisted)
```typescript
// File: server/src/app/api/jobs.module.ts (add to)
// JobOffer exists in PlaceInstance.jobOffers but is not a database entity
// Regenerates every N minutes (configurable per place)

export interface JobOffer {
  id: string;  // Temporary ID for frontend keying
  cargoType: string;
  load: number;
  pay: number;
  payType: 'GOLD' | 'GEMS';
  startPlaceInstanceId: string;  // Where to pick up (must be player's)
  endPlaceInstanceId: string;    // Where to deliver (must be player's)
  startPlaceName: string;        // For display
  endPlaceName: string;           // For display
}
```

#### 7. CargoType Enum
```typescript
// File: server/src/app/api/vehicles.module.ts (or separate)
// Static data defined in backend, exposed via API

export const CargoTypes = [
  'Coal',
  'Grain',
  'Electronics',
  'Machinery',
  'Textiles',
  'Food',
  'Lumber',
  'Ore',
  'Vehicles',
  'Chemicals'
] as const;

export type CargoType = typeof CargoTypes[number];
```

---

## Map Visibility Rules

### Display Rules
- **Owned places**: Full color, interactive, show jobs
- **Grayed places**: 1 PlaceConnection hop from any owned place, can purchase, no jobs
- **Connections between owned places**: Full color line
- **Connections involving grayed places**: Gray dashed line

### Algorithm
```typescript
// A place is visible if:
// 1. Player owns it (PlaceInstance exists), OR
// 2. It's directly connected (1 hop) via PlaceConnection to ANY owned PlaceInstance

function getPlayerMapView(playerId: string): { owned: Place[], available: Place[] } {
  // 1. Get all player's PlaceInstances
  const ownedPlaceInstances = await placeInstanceRepo.find({ playerId });
  const ownedTemplateIds = ownedPlaceInstances.map(pi => pi.place._id.toString());

  // 2. Find all connected template places (1 hop)
  const connectedTemplateIds = new Set<string>();
  for (const ownedId of ownedTemplateIds) {
    const connections = await placeConnectionRepo.find({
      where: [
        { startId: new ObjectId(ownedId) },
        { endId: new ObjectId(ownedId) }
      ]
    });
    for (const conn of connections) {
      connectedTemplateIds.add(conn.startId.toString());
      connectedTemplateIds.add(conn.endId.toString());
    }
  }

  // 3. Separate owned vs available (available = connected but not owned)
  const availableTemplateIds = [...connectedTemplateIds]
    .filter(id => !ownedTemplateIds.includes(id));

  return {
    owned: await placeRepo.findByIds(ownedTemplateIds),
    available: await placeRepo.findByIds(availableTemplateIds)
  };
}
```

---

## New Services

### Service File Structure
```
server/src/app/
├── game/
│   ├── game.module.ts              # Combines all game services
│   │
│   ├── scheduler/
│   │   ├── scheduler.interface.ts  # Abstract interface
│   │   └── in-memory-scheduler.service.ts  # V1 implementation
│   │
│   ├── game-clock/
│   │   └── game-clock.service.ts   # Game time tracking
│   │
│   ├── map-reveal/
│   │   └── map-reveal.service.ts   # Calculate visible places
│   │
│   ├── place-purchase/
│   │   ├── place-purchase.service.ts
│   │   └── place-purchase.controller.ts
│   │
│   ├── job-offer/
│   │   ├── job-offer.service.ts
│   │   └── job-offer.controller.ts
│   │
│   ├── vehicle-dispatch/
│   │   ├── vehicle-dispatch.service.ts
│   │   └── vehicle-dispatch.controller.ts
│   │
│   └── economy/
│       └── economy.service.ts
```

### 1. SchedulerService

**Purpose**: Schedule delayed events (vehicle arrivals, job refresh)

**Interface** (for future Redis swap):
```typescript
export interface ISchedulerEvent {
  id: string;
  event: string;
  payload: any;
  executeAt: Date;
}

export interface ISchedulerService {
  schedule(event: string, payload: any, delayMs: number): string;
  cancel(taskId: string): boolean;
  getPending(): ISchedulerEvent[];
  on(event: string, handler: (payload: any) => void): void;
}
```

**In-Memory Implementation**:
```typescript
// V1 uses setTimeout - survives server restart is NOT supported
@Injectable()
export class InMemorySchedulerService implements ISchedulerService {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private handlers: Map<string, Array<(payload: any) => void>> = new Map();

  schedule(event: string, payload: any, delayMs: number): string {
    const id = crypto.randomUUID();
    const timer = setTimeout(() => {
      this.timers.delete(id);
      this.handlers.get(event)?.forEach(h => h(payload));
    }, delayMs);
    this.timers.set(id, timer);
    return id;
  }

  cancel(taskId: string): boolean {
    const timer = this.timers.get(taskId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(taskId);
      return true;
    }
    return false;
  }

  on(event: string, handler: (payload: any) => void): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event).push(handler);
  }
}
```

**Note**: Redis-backed Bull would be better for production due to:
- Survives server restarts
- Horizontal scaling (multiple instances)
- Built-in retry logic
- Admin dashboard

Design allows swapping by implementing same interface.

### 2. GameClockService

**Purpose**: Track game time (separate from wall clock for future pause/speed control)

```typescript
@Injectable()
export class GameClockService {
  private gameTimeMs: number = 0;
  private speed: number = 1; // 1 real ms = 1 game ms for V1

  getGameTime(): number {
    return this.gameTimeMs;
  }

  syncWithWallClock(): void {
    this.gameTimeMs = Date.now();
  }

  // Future: pause(), resume(), setSpeed()
}
```

### 3. MapRevealService

**Purpose**: Calculate which places a player can see and buy

```typescript
@Injectable()
export class MapRevealService {
  constructor(
    private placeInstanceRepo: PlaceInstanceRepository,
    private placeConnectionRepo: PlaceConnectionRepository,
    private placeRepo: PlacesService
  ) {}

  async getOwnedPlaceInstances(playerId: string): Promise<PlaceInstance[]> {
    return this.placeInstanceRepo.find({ playerId });
  }

  async getAvailablePlaces(playerId: string): Promise<Place[]> {
    const owned = await this.getOwnedPlaceInstances(playerId);
    const ownedTemplateIds = owned.map(p => p.place._id.toString());

    const connectedIds = new Set<string>();
    for (const oid of ownedTemplateIds) {
      const conns = await this.placeConnectionRepo.findByPlaceId(oid);
      conns.forEach(c => {
        connectedIds.add(c.startId.toString());
        connectedIds.add(c.endId.toString());
      });
    }

    const availableIds = [...connectedIds].filter(id => !ownedTemplateIds.includes(id));
    return this.placeRepo.findByIds(availableIds);
  }
}
```

### 4. PlacePurchaseService

**Purpose**: Handle buying places

```typescript
@Injectable()
export class PlacePurchaseService {
  constructor(
    private playerRepo: PlayersService,
    private economyService: EconomyService,
    private placeInstanceRepo: PlaceInstancesService,
    private mapRevealService: MapRevealService
  ) {}

  async purchasePlace(playerId: string, placeTemplateId: string): Promise<PlaceInstance> {
    // 1. Check place is available (visible and not owned)
    const available = await this.mapRevealService.getAvailablePlaces(playerId);
    const place = available.find(p => p._id.toString() === placeTemplateId);
    if (!place) throw new BadRequestException('Place not available for purchase');

    // 2. Check player can afford
    const player = await this.playerRepo.findOne(playerId);
    if (player.wallet.gold < place.priceGold) throw new BadRequestException('Not enough gold');
    if (player.wallet.gems < place.priceGems) throw new BadRequestException('Not enough gems');

    // 3. Deduct cost
    await this.economyService.debitPlayer(playerId, place.priceGold, 'GOLD', 'Place purchase');
    if (place.priceGems > 0) {
      await this.economyService.debitPlayer(playerId, place.priceGems, 'GEMS', 'Place purchase');
    }

    // 4. Create PlaceInstance
    const placeInstance = await this.placeInstanceRepo.create({
      place: place,
      playerId,
      gameId: player.gameId
    });

    return placeInstance;
  }
}
```

### 5. JobOfferService

**Purpose**: Generate job offers at owned places

**Rules**:
- Jobs only generated between owned places (player to player)
- At Place X, jobs are: deliver TO other owned places
- Jobs regenerate on timer (default 5 min, configurable per place)

```typescript
@Injectable()
export class JobOfferService {
  constructor(
    private placeInstanceRepo: PlaceInstancesService,
    private placeRepo: PlacesService
  ) {}

  async generateOffersForPlace(placeInstanceId: string): Promise<JobOffer[]> {
    const placeInst = await this.placeInstanceRepo.findOne(placeInstanceId);
    const allOwned = await this.placeInstanceRepo.find({ playerId: placeInst.playerId });

    // Need 2+ places for jobs
    if (allOwned.length < 2) return [];

    const offers: JobOffer[] = [];
    const otherPlaces = allOwned.filter(p => p._id.toString() !== placeInstanceId);

    for (const dest of otherPlaces) {
      // 0-2 jobs per destination pair
      const numJobs = Math.floor(Math.random() * 3); // 0, 1, or 2
      for (let i = 0; i < numJobs; i++) {
        offers.push(this.generateRandomJob(placeInst, dest));
      }
    }

    // Update place instance
    placeInst.jobOffers = offers;
    await this.placeInstanceRepo.save(placeInst);

    return offers;
  }

  private generateRandomJob(source: PlaceInstance, dest: PlaceInstance): JobOffer {
    return {
      id: new ObjectId().toString(),
      cargoType: this.randomCargoType(),
      load: Math.floor(Math.random() * 90) + 10, // 10-100
      pay: Math.floor(Math.random() * 450) + 50, // 50-500
      payType: Math.random() > 0.9 ? 'GEMS' : 'GOLD',
      startPlaceInstanceId: source._id.toString(),
      endPlaceInstanceId: dest._id.toString(),
      startPlaceName: source.place.name,
      endPlaceName: dest.place.name
    };
  }

  private randomCargoType(): string {
    const types = ['Coal', 'Grain', 'Electronics', 'Machinery', 'Textiles', 'Food', 'Lumber', 'Ore', 'Vehicles', 'Chemicals'];
    return types[Math.floor(Math.random() * types.length)];
  }
}
```

### 6. VehicleDispatchService

**Purpose**: Handle dispatching vehicles and processing arrivals

```typescript
@Injectable()
export class VehicleDispatchService {
  constructor(
    private vehicleInstanceRepo: VehicleInstancesService,
    private placeConnectionRepo: PlaceConnectionRepository,
    private jobRepo: JobsService,
    private economyService: EconomyService,
    private schedulerService: InMemorySchedulerService
  ) {
    // Register arrival handler
    this.schedulerService.on('vehicle:arrival', this.processArrival.bind(this));
  }

  async dispatch(dto: DispatchVehicleDto): Promise<VehicleInstance> {
    const vehicle = await this.vehicleInstanceRepo.findOne(dto.vehicleInstanceId);

    // 1. Validate vehicle is at a place
    if (vehicle.status !== 'AT_PLACE' || !vehicle.currentPlaceInstance) {
      throw new BadRequestException('Vehicle must be at a place to dispatch');
    }

    // 2. Validate player owns ALL places in route
    // (omitted for brevity - similar logic)

    // 3. Validate route connectivity (each consecutive pair has a PlaceConnection)
    await this.validateRoute(dto.routePlaceInstanceIds);

    // 4. Calculate travel time
    const travelTimeMs = await this.calculateTravelTime(vehicle, dto.routePlaceInstanceIds);

    // 5. Update vehicle state
    vehicle.status = 'IN_TRANSIT';
    vehicle.currentPlaceInstance = null; // In transit
    vehicle.destinationPlaceInstance = dto.routePlaceInstanceIds[1];
    vehicle.route = dto.routePlaceInstanceIds;
    vehicle.startTime = new Date();
    vehicle.endTime = new Date(Date.now() + travelTimeMs);

    await this.vehicleInstanceRepo.save(vehicle);

    // 6. Schedule arrival event
    this.schedulerService.schedule('vehicle:arrival',
      { vehicleId: vehicle._id.toString(), route: dto.routePlaceInstanceIds, routeIndex: 1 },
      travelTimeMs
    );

    return vehicle;
  }

  private async processArrival(payload: { vehicleId: string, route: string[], routeIndex: number }) {
    const { vehicleId, route, routeIndex } = payload;
    const vehicle = await this.vehicleInstanceRepo.findOne(vehicleId);
    const arrivalPlaceId = route[routeIndex];

    // 1. Check for job deliveries
    const jobsOnVehicle = await this.jobRepo.find({ vehicleInstanceId: vehicleId });
    for (const job of jobsOnVehicle) {
      if (job.endPlaceId.toString() === arrivalPlaceId.toString()) {
        // DELIVERED!
        await this.economyService.creditPlayer(
          vehicle.playerId, job.pay, job.payType, 'Job delivery'
        );
        await this.jobRepo.delete(job._id);
      }
    }

    // 2. Update vehicle position
    vehicle.currentPlaceInstance = await this.placeInstanceRepo.findOne(arrivalPlaceId);
    vehicle.destinationPlaceInstance = null;

    // 3. Check if more stops
    if (routeIndex < route.length - 1) {
      const nextIndex = routeIndex + 1;
      const travelTime = await this.calculateLegTime(vehicle, arrivalPlaceId, route[nextIndex]);

      vehicle.destinationPlaceInstance = await this.placeInstanceRepo.findOne(route[nextIndex]);
      vehicle.endTime = new Date(Date.now() + travelTime);
      await this.vehicleInstanceRepo.save(vehicle);

      this.schedulerService.schedule('vehicle:arrival',
        { vehicleId, route, routeIndex: nextIndex },
        travelTime
      );
    } else {
      // Journey complete
      vehicle.status = 'AT_PLACE';
      vehicle.route = [];
      vehicle.endTime = null;
      await this.vehicleInstanceRepo.save(vehicle);
    }
  }
}
```

### 7. EconomyService

**Purpose**: Handle wallet operations and payments

```typescript
@Injectable()
export class EconomyService {
  constructor(private playerRepo: PlayersService, private transactionRepo: TransactionsService) {}

  async creditPlayer(playerId: string, amount: number, type: 'GOLD' | 'GEMS', description: string): Promise<void> {
    const field = `wallet.${type.toLowerCase()}`;
    await this.playerRepo.increment({ _id: new ObjectId(playerId) }, field, amount);

    await this.transactionRepo.create({
      type: 'GAME_ACTION',
      targetType: 'PLAYER',
      targetId: playerId,
      payload: { amount, currency: type },
      description
    });
  }

  async debitPlayer(playerId: string, amount: number, type: 'GOLD' | 'GEMS', description: string): Promise<boolean> {
    const player = await this.playerRepo.findOne(playerId);
    const currentBalance = player.wallet[type.toLowerCase()];

    if (currentBalance < amount) {
      return false; // Insufficient funds
    }

    await this.playerRepo.decrement({ _id: new ObjectId(playerId) }, field, amount);
    return true;
  }
}
```

---

## API Endpoints

### New Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `POST /players/:id/select-starting-place` | POST | Choose starting Place → creates first PlaceInstance + starter vehicle | LoggedIn |
| `GET /players/:id/map-view` | GET | Get owned places + available places | LoggedIn |
| `POST /players/:id/purchase-place` | POST | Buy available place | LoggedIn |
| `GET /place-instances/:id/jobs` | GET | Get job offers at this owned place | LoggedIn |
| `POST /place-instances/:id/accept-job` | POST | Accept job offer → creates Job entity | LoggedIn |
| `POST /place-instances/:id/warehouse-job` | POST | Leave job at this place (from vehicle) | LoggedIn |
| `POST /vehicles/:id/dispatch` | POST | Dispatch vehicle with route | LoggedIn |
| `POST /vehicles/:id/load-job` | POST | Load job from place into vehicle | LoggedIn |
| `POST /vehicles/:id/unload-job` | POST | Unload job at current place | LoggedIn |
| `GET /jobs/:id` | GET | Get job details | LoggedIn |

### Request/Response Examples

#### POST /players/:id/select-starting-place
```json
// Request
{ "placeTemplateId": "60d5f..." }

// Response
{
  "placeInstance": { "id": "...", "place": {...}, "playerId": "..." },
  "vehicleInstance": { "id": "...", "vehicle": {...}, "currentPlaceInstance": "..." },
  "wallet": { "gold": 10000, "gems": 100 }
}
```

#### GET /players/:id/map-view
```json
// Response
{
  "owned": [
    { "id": "...", "place": { "name": "Warehouse A", "lat": 45.0, "lng": 25.0, "type": "WAREHOUSE" }, "jobOffers": [...] }
  ],
  "available": [
    { "id": "...", "name": "Station B", "lat": 45.1, "lng": 25.1, "priceGold": 2000, "priceGems": 0 }
  ],
  "connections": [
    { "startPlaceId": "...", "endPlaceId": "...", "type": "RAIL" }
  ]
}
```

#### POST /vehicles/:id/dispatch
```json
// Request
{
  "destinationPlaceInstanceId": "60d5f...",
  "routePlaceInstanceIds": ["60d5a...", "60d5b...", "60d5f..."]
}

// Response
{
  "id": "...",
  "status": "IN_TRANSIT",
  "currentPlaceInstance": null,
  "destinationPlaceInstance": "...",
  "route": ["60d5a...", "60d5b...", "60d5f..."],
  "startTime": "2026-03-23T10:00:00Z",
  "endTime": "2026-03-23T10:30:00Z"
}
```

---

## Frontend Components

### New Components Needed

| Component | Description | File |
|-----------|-------------|------|
| `PlayerMapView` | Main map showing owned (colored) + available (grayed) places | `web/app/components/` |
| `PlaceMarker` | Clickable marker for places (different styles for owned/available) | `web/app/components/` |
| `BuyPlaceModal` | Dialog when clicking available place, shows price + confirm | `web/app/components/` |
| `JobBoard` | Panel showing available jobs at selected owned place | `web/app/components/` |
| `VehicleDispatchPanel` | Form to select vehicle, pick route, dispatch | `web/app/components/` |
| `RoutePickerOverlay` | Map overlay for clicking places to form route | `web/app/components/` |
| `WalletDisplay` | Shows gold/gems balance | `web/app/components/` |
| `OwnedPlacesList` | Sidebar list of player's places | `web/app/components/` |

### Page Structure
```
/game
├── PlayerMapView (main game view)
│   ├── WalletDisplay (top bar)
│   ├── OwnedPlacesList (sidebar)
│   ├── Map (Leaflet)
│   │   ├── PlaceMarker (for each owned/available place)
│   │   └── RoutePickerOverlay (when dispatching)
│   ├── BuyPlaceModal (when clicking available place)
│   ├── JobBoard (when at a place)
│   └── VehicleDispatchPanel (when dispatching)
```

---

## Implementation Order

### Week 1: Foundation
- [ ] SchedulerService (interface + in-memory)
- [ ] GameClockService
- [ ] Test basic scheduling works

### Week 2: Player Initialization
- [ ] Change starting resources in Games.tsx: 100 gold → 10,000 gold + 100 gems
- [ ] Modify join flow to redirect to "Select Starting Place" after Player created
- [ ] Add price fields to Place entity
- [ ] Add level/price/speed/capacity to Vehicle entity
- [ ] Refactor VehicleInstance (currentPlaceInstance, route, status)
- [ ] Add select-starting-place endpoint
- [ ] MapRevealService
- [ ] PlacePurchaseService

### Week 3: Job System
- [ ] Update Job entity (cargoType, placeInstanceId, vehicleInstanceId)
- [ ] JobOfferService (generate offers between owned places)
- [ ] Accept job endpoint
- [ ] Load/unload job endpoints
- [ ] Job warehousing at 3rd places

### Week 4: Vehicle Dispatch
- [ ] Dispatch endpoint with route validation
- [ ] Arrival handler with job delivery
- [ ] Payment on delivery
- [ ] Multi-stop handling

### Week 5: Frontend Game View
- [ ] PlayerMapView page
- [ ] Place markers (owned vs available styles)
- [ ] BuyPlaceModal
- [ ] JobBoard component
- [ ] VehicleDispatchPanel
- [ ] RoutePicker (click on map to build route)
- [ ] Wallet display

### Week 6: Polish
- [ ] Vehicle position animation on map
- [ ] PlaceInstance job boards
- [ ] Error handling
- [ ] Integration testing

---

## Key Algorithms

### 1. Route Validation
```typescript
async validateRoute(route: string[]): Promise<void> {
  for (let i = 0; i < route.length - 1; i++) {
    const startId = route[i];
    const endId = route[i + 1];

    // Get template Place IDs
    const startTemplateId = (await this.placeInstanceRepo.findOne(startId)).place._id;
    const endTemplateId = (await this.placeInstanceRepo.findOne(endId)).place._id;

    // Check PlaceConnection exists (in either direction)
    const connection = await this.placeConnectionRepo.findOne({
      where: [
        { startId: startTemplateId, endId: endTemplateId },
        { startId: endTemplateId, endId: startTemplateId }
      ]
    });

    if (!connection) {
      throw new BadRequestException(`No route between ${startId} and ${endId}`);
    }
  }
}
```

### 2. Travel Time Calculation
```typescript
async calculateTravelTime(vehicle: VehicleInstance, route: string[]): Promise<number> {
  let totalDistance = 0;

  for (let i = 0; i < route.length - 1; i++) {
    const startTemplateId = (await this.placeInstanceRepo.findOne(route[i])).place._id;
    const endTemplateId = (await this.placeInstanceRepo.findOne(route[i + 1])).place._id;

    const connection = await this.placeConnectionRepo.findConnection(startTemplateId, endTemplateId);
    const distance = this.calculateDistanceFromConnection(connection);
    totalDistance += distance;
  }

  // Time = distance / speed (convert to ms)
  // Assume speed is in km per ms for simplicity
  return Math.ceil(totalDistance / vehicle.vehicle.speed);
}

private calculateDistanceFromConnection(connection: PlaceConnection): number {
  // Connection.content contains route points [{lat, lng}, ...]
  // Calculate total distance along the polyline
  const points = connection.content?.routePoints || [];
  let distance = 0;

  for (let i = 0; i < points.length - 1; i++) {
    distance += this.haversine(points[i], points[i + 1]);
  }

  return distance;
}

private haversine(p1: {lat: number, lng: number}, p2: {lat: number, lng: number}): number {
  // Returns distance in km
  const R = 6371;
  const dLat = this.toRad(p2.lat - p1.lat);
  const dLon = this.toRad(p2.lng - p1.lng);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRad(p1.lat)) * Math.cos(this.toRad(p2.lat)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

### 3. Map Visibility
```typescript
// See "Map Visibility Rules" section above for full implementation
```

---

## Decision Log

### Why Scheduled Tasks vs Ticks?

**Initial Question**: Should time progress via tick-based setInterval or scheduled tasks based on actual arrival times?

**Decision**: Hybrid approach - scheduled tasks for arrivals, short ticks for visual updates.

**Reasoning**:
- Tick-based (every 5 seconds check for arrivals) wastes resources when nothing is happening
- Scheduled tasks only wake when needed (when a vehicle arrives)
- Short 1-2s tick still needed for vehicle position interpolation on map
- This is how most browser games handle it (Travian, Grepolis, etc.)

**Future**: Can swap to Redis-backed Bull by implementing same interface without changing business logic.

### Why PlaceInstance References for Routes?

**Question**: Should VehicleInstance store `start`/`end` as Place (template) or PlaceInstance?

**Decision**: PlaceInstance references.

**Reasoning**:
- Player owns PlaceInstances, not template Places
- Routes are between player's places, not template places
- When player sells a place, VehicleInstance should reflect that change
- Template Place is just for display info (name, coords, type)

### Why Job.payment Stays With Job?

**Decision**: Payment is attached to Job entity when created, not calculated at delivery.

**Reasoning**:
- Allows future "time pressure" mechanics where payment decreases if delivered late
- Allows "bonus" payment if delivered early
- Clean separation: Job is the contract, delivery is the action
- Simpler V1: payment is fixed, but design supports future expansion

### Why Grayed Places = 1 Hop?

**Decision**: Players can see places exactly 1 connection away from any owned place.

**Reasoning**:
- Creates natural expansion progression
- Player sees immediate options without overwhelming with whole map
- As player buys places, new options naturally reveal
- Classic strategy game fog-of-war pattern

### Why Jobs Only Between Owned Places?

**Decision**: Jobs are player-to-player within their own network, not from external sources.

**Reasoning**:
- V1 is minimal viable game - external economy adds complexity
- Player runs transport business within their own network
- As they expand, more internal routes become available
- Future: can add "trade routes" to external/npc cities

### Why In-Memory Scheduler for V1?

**Decision**: Use setTimeout/setInterval instead of Redis-backed queue.

**Reasoning**:
- Simpler to implement and debug
- No additional infrastructure (Redis)
- Fine for single-instance, low vehicle count
- Design allows swap to Bull later by implementing same interface
- If server restarts, V1 just resets - acceptable for experiment

### User/Player/Game Architecture Discovery

**Question**: How do Users, Players, and Games relate? What is the existing "join game" flow?

**Finding**: The architecture is already implemented:

```
User (users collection)
├── email, username, password, scope
└── Has many Players

Player (players collection)
├── name, description
├── userId (ref to User)
├── gameId (ref to Game)
├── wallet: { gold, gems, parts }
└── Belongs to 1 Game

Game (games collection)
├── name, description, type: TEMPLATE | GAME
└── Is the "tenant" container
```

**Existing Flow** (confirmed by examining Games.tsx and playersStore.ts):
1. User registers at `/register` → creates User
2. User logs in at `/login` → gets JWT
3. User browses `/games` → sees games of type GAME
4. User clicks "Join Game" → modal for player name/description
5. User clicks "Save" → POST /api/players creates Player
6. Player starts with: **100 gold, 0 gems, 0 parts** (currently hardcoded in Games.tsx line 91)

**V1 Changes Needed**:
1. Change starting resources: 100 gold → 10,000 gold + 100 gems
2. After creating Player, redirect to "Select Starting Place" page (NEW)
3. Select Starting Place → creates PlaceInstance + VehicleInstance (not yet implemented)
4. Game state transitions: NEW → PLAYING

---

## Final V1 Design Decisions

All open questions have been resolved:

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Starter vehicle | **One default locomotive** | Simpler for V1, variety comes later |
| 2 | Job timing | **Global tick** | Easier to implement and reason about |
| 3 | Connection ownership | **Available (not purchasable)** | V1 is single-player focused. **Future**: shared congestion penalty for multiplayer |
| 4 | Vehicle upgrades | **No upgrades (1 engine, 0 aux cars)** | Ship V1 fast, upgrade system is V2 |
| 5 | Capacity | **Enforced** | Core logistics gameplay |
| 6 | Fuel | **Burn but unlimited** | Realism through stats, no management overhead |

---

## Decision Log (Continued)

### Vehicle Upgrade System Details

**Question**: How do vehicle upgrades work? What's the difference between Vehicle and VehicleInstance?

**Finding** (confirmed by examining vehicles.module.ts):

```
Vehicle (template - created by admin)
├── engineMax: number      // max engines player can add (e.g., 4)
├── engineLoad: number     // cargo capacity per engine (e.g., 50)
├── engineFuel: number     // fuel per engine (e.g., 100)
├── auxMax: number         // max auxiliary cars (e.g., 3)
├── auxLoad: number        // cargo per aux car (e.g., 30)
├── auxFuel: number        // fuel per aux car (e.g., 50)
├── speed: number          // speed modifier
└── priceGold, priceGems   // purchase price

VehicleInstance (player-owned)
├── vehicle: Vehicle       // reference to template
├── currentEngines: number // current engine count (starts at 1)
├── currentAuxCars: number // current aux car count (starts at 0)
└── content.upgrades: { engines, auxCars }  // stored here
```

**Calculations**:
- Total cargo capacity = `(engineLoad * currentEngines) + (auxLoad * currentAuxCars)`
- Total fuel capacity = `(engineFuel * currentEngines) + (auxFuel * currentAuxCars)`
- Max engines player can buy = `engineMax`
- Max aux cars player can buy = `auxMax`

### Fuel Burn Rate System

**Question**: How should fuel consumption work? Should it vary based on cargo load?

**Decision**: Yes, fuel burn should scale with cargo load.

**Formula**:
```
fuelBurnRate = baseBurn + (totalLoad * perLoadBurn)
```

**Fields Added to Vehicle**:
- `fuelBaseBurn`: Base fuel consumption per distance unit (when empty)
- `fuelPerLoadBurn`: Additional fuel consumed per unit of cargo load

**Example**:
- Vehicle with `fuelBaseBurn=5`, `fuelPerLoadBurn=0.1`
- Traveling empty: burnRate = 5
- Traveling with 50 units of cargo: burnRate = 5 + (50 * 0.1) = 10

**Why this model**:
- Heavier loads require more fuel (realistic)
- Base burn ensures even empty vehicles consume fuel
- Allows different vehicle types to have different efficiency (locomotive vs truck)

**Future considerations**:
- Could add terrain modifiers (hills use more fuel)
- Could add weather modifiers
- Fuel prices could vary by place

### Connection Ownership - Future Idea: Shared Congestion

**Idea** (not implemented in V1): Instead of explicit connection ownership, use shared congestion.

**How it would work**:
- Multiple players can use the same PlaceConnection
- More traffic = slower travel for everyone using that route
- Creates natural competition for popular routes without explicit ownership
- Players incentivized to find/buy exclusive routes

**This is a multiplayer consideration for later. Not in V1 scope.**

---

## Notes for Implementation

### Existing Files to Modify

| File | Change |
|------|--------|
| `web/app/pages/Games.tsx` (line ~91) | Change starting gold from 100 to 10000, add 100 gems |
| `web/app/pages/Games.tsx` | After `addPlayer` success, redirect to "Select Starting Place" |
| `web/app/pages/SelectStartingPlace.tsx` | NEW page - list places, let player pick, create PlaceInstance + VehicleInstance |
| `server/src/app/api/vehicle-instances.module.ts` | Refactor start/end → currentPlaceInstance/destinationPlaceInstance |
| `server/src/app/api/places.module.ts` | Add priceGold, priceGems fields |
| `server/src/app/api/vehicles.module.ts` | Add priceGold, priceGems fields (speed/engine/aux already exist) |

### Existing Files to Create

| File | Description |
|------|-------------|
| `server/src/app/game/...` | New game services (scheduler, dispatch, job-offer, etc.) |
| `web/app/pages/SelectStartingPlace.tsx` | New page for initial place selection |
| `web/app/pages/Game.tsx` | Main player game view (map, jobs, vehicles) |

### V1 Scope Summary

**INCLUDED in V1**:
- Starting place selection (1 free place)
- Starter vehicle (1 locomotive, 1 engine, 0 aux cars)
- Place purchasing with gold/gems
- Job offers between owned places (global refresh)
- Enforced vehicle capacity
- Fuel burn displayed but unlimited
- All PlaceConnections available (no ownership)

**NOT in V1** (V2+):
- Vehicle upgrades (more engines/cars)
- Fuel management (refueling at places)
- Per-place job timers
- Connection ownership/purchase
- Multiplayer interactions
- Shared congestion on routes (future idea for multiplayer)

### General Notes

- All file paths are relative to server/src/app/api/
- Frontend paths are relative to web/app/
- MongoDB ObjectId is used for all entity IDs
- Breaking changes to VehicleInstance require data migration for existing games
- Test with small map (5-10 places) first before scaling
