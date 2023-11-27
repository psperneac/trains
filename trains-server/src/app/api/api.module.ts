import { JobsModule } from './jobs/jobs.module';
import { MapPlaceConnectionModule } from './maps/map-place-connection.module';
import { MapPlaceModule } from './maps/map-place.module';
import { MapTemplateModule } from './maps/map-template.module';
import { PlaceConnectionInstancesModule } from './places/place-connection-instance.module';
import { PlaceConnectionsModule } from './places/place-connection.module';
import { PlaceInstanceJobOffersModule } from './places/place-instance-job-offer.module';
import { PlaceInstanceJobsModule } from './places/place-instance-job.module';
import { PlaceInstance } from './places/place-instance.entity';
import { PlaceInstancesModule } from './places/place-instance.module';
import { PlayersModule } from './players/player.module';
import { PostsModule } from './posts/posts.module';
import { PlaceModule } from './places/place.module';
import { UserPreferenceModule } from './users/user-preference.module';
import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';
import { TranslationsModule } from './translations/translations.module';
import { VehicleInstanceJobsModule } from './vehicles/vehicle-instance-job.module';
import { VehicleInstancesModule } from './vehicles/vehicle-instance.module';
import { VehicleTypesModule } from './vehicles/vehicle-types.module';
import {PlaceTypeModule} from "./places/place-type.module";
import { VehicleModule } from './vehicles/vehicle.module';

@Module({
  imports: [
    PlaceModule,
    PostsModule,
    UsersModule,
    TranslationsModule,
    VehicleTypesModule,
    PlaceTypeModule,
    VehicleModule,
    PlaceConnectionsModule,
    MapPlaceModule,
    MapPlaceConnectionModule,
    MapTemplateModule,
    PlaceConnectionInstancesModule,
    PlaceInstancesModule,
    PlaceInstanceJobsModule,
    PlaceInstanceJobOffersModule,
    PlayersModule,
    VehicleInstancesModule,
    VehicleInstanceJobsModule,
    UserPreferenceModule,
  ],
})
export class ApiModule {
}
