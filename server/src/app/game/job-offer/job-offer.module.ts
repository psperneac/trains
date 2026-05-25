import { Module } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';
import { PlaceInstancesModule } from '../../api/place-instance.module';
import { PlacesModule } from '../../api/places.module';
import { InMemorySchedulerService } from '../scheduler/in-memory-scheduler.service';
import { EventsGatewayModule } from '../events-gateway/events-gateway.module';

@Module({
  imports: [
    PlaceInstancesModule,
    PlacesModule,
    EventsGatewayModule
  ],
  providers: [
    InMemorySchedulerService,
    JobOfferService
  ],
  exports: [JobOfferService]
})
export class JobOfferModule {}