import { Module } from '@nestjs/common';
import { InMemorySchedulerService } from './scheduler/in-memory-scheduler.service';
import { GameClockService } from './game-clock/game-clock.service';

@Module({
  providers: [InMemorySchedulerService, GameClockService],
  exports: [InMemorySchedulerService, GameClockService]
})
export class GameModule {}
