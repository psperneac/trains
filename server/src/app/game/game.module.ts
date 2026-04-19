import { Module } from '@nestjs/common';
import { InMemorySchedulerService } from './scheduler/in-memory-scheduler.service';
import { GameClockService } from './game-clock/game-clock.service';
import { EconomyService } from './economy/economy.service';
import { PlayersModule } from '../api/support/players.module';
import { TransactionsModule } from '../api/support/transactions.module';

@Module({
  imports: [PlayersModule, TransactionsModule],
  providers: [InMemorySchedulerService, GameClockService, EconomyService],
  exports: [InMemorySchedulerService, GameClockService, EconomyService]
})
export class GameModule {}
