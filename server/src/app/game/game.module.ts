import { Module } from '@nestjs/common';
import { InMemorySchedulerService } from './scheduler/in-memory-scheduler.service';
import { GameClockService } from './game-clock/game-clock.service';
import { EconomyService } from './economy/economy.service';
import { MapRevealService } from './map-reveal/map-reveal.service';
import { PlacePurchaseService } from './place-purchase/place-purchase.service';
import { PlacePurchaseController } from './place-purchase/place-purchase.controller';
import { JobOfferModule } from './job-offer/job-offer.module';
import { JobOfferController } from './job-offer/job-offer.controller';
import { VehicleDispatchService } from './vehicle-dispatch/vehicle-dispatch.service';
import { VehicleDispatchController } from './vehicle-dispatch/vehicle-dispatch.controller';
import { PlayerInitService } from './player-init/player-init.service';
import { PlayerInitController } from './player-init/player-init.controller';
import { GameController } from './game.controller';
import { PlayersModule } from '../api/support/players.module';
import { TransactionsModule } from '../api/support/transactions.module';
import { PlaceInstancesModule } from '../api/place-instance.module';
import { PlaceConnectionsModule } from '../api/place-connection.module';
import { PlacesModule } from '../api/places.module';
import { VehiclesModule } from '../api/vehicles.module';
import { VehicleInstancesModule } from '../api/vehicle-instances.module';
import { JobsModule } from '../api/jobs.module';
import { AuthenticationModule } from '../../authentication/authentication.module';
import { EventsGatewayModule } from './events-gateway/events-gateway.module';

@Module({
  imports: [
    PlayersModule,
    TransactionsModule,
    PlaceInstancesModule,
    PlaceConnectionsModule,
    PlacesModule,
    VehiclesModule,
    VehicleInstancesModule,
    JobsModule,
    AuthenticationModule,
    EventsGatewayModule,
    JobOfferModule
  ],
  controllers: [PlacePurchaseController, JobOfferController, VehicleDispatchController, PlayerInitController, GameController],
  providers: [
    InMemorySchedulerService,
    GameClockService,
    EconomyService,
    MapRevealService,
    PlacePurchaseService,
    VehicleDispatchService,
    PlayerInitService
  ],
  exports: [
    InMemorySchedulerService,
    GameClockService,
    EconomyService,
    MapRevealService,
    PlacePurchaseService,
    VehicleDispatchService,
    PlayerInitService
  ]
})
export class GameModule {}
