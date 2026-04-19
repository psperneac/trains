import { Module } from '@nestjs/common';
import { InMemorySchedulerService } from './scheduler/in-memory-scheduler.service';

@Module({
  providers: [InMemorySchedulerService],
  exports: [InMemorySchedulerService]
})
export class GameModule {}
