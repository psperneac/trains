import { Module } from '@nestjs/common';
import { InMemorySchedulerService } from './scheduler/in-memory-scheduler.service';
import { GameClockService } from './game-clock/game-clock.service';
import { EconomyService } from './economy/economy.service';
import { MapRevealService } from './map-reveal/map-reveal.service';
import { PlacePurchaseService } from './place-purchase/place-purchase.service';
import { PlacePurchaseController } from './place-purchase/place-purchase.controller';
import { PlayersModule } from '../api/support/players.module';
import { TransactionsModule } from '../api/support/transactions.module';
import { PlaceInstancesModule } from '../api/place-instance.module';
import { PlaceConnectionsModule } from '../api/place-connection.module';
import { PlacesModule } from '../api/places.module';
import { AuthenticationModule } from '../../authentication/authentication.module';

@Module({
  imports: [
    PlayersModule,
    TransactionsModule,
    PlaceInstancesModule,
    PlaceConnectionsModule,
    PlacesModule,
    AuthenticationModule
  ],
  controllers: [PlacePurchaseController],
  providers: [InMemorySchedulerService, GameClockService, EconomyService, MapRevealService, PlacePurchaseService],
  exports: [InMemorySchedulerService, GameClockService, EconomyService, MapRevealService, PlacePurchaseService]
})
export class GameModule {}
