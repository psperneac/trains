import { JobsModule } from './jobs/jobs.module';
import { MapPlaceConnectionsModule } from './maps/map-place-connections.module';
import { MapPlacesModule } from './maps/map-places.module';
import { MapTemplateModule } from './maps/map-template.module';
import { PlaceConnectionInstancesModule } from './places/map-place-connection-instance.module';
import { PlaceConnectionsModule } from './places/place-connection.module';
import { MapPlaceInstanceJobOffersModule } from './places/map-place-instance-job-offer.module';
import { MapPlaceInstanceJobsModule } from './places/map-place-instance-job.module';
import { MapPlaceInstance } from './places/map-place-instance.entity';
import { MapPlaceInstancesModule } from './places/map-place-instance.module';
import { PlayersModule } from './players/player.module';
import { WalletModule } from './players/wallet.module';
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
    MapPlacesModule,
    MapPlaceConnectionsModule,
    MapTemplateModule,
    PlaceConnectionInstancesModule,
    MapPlaceInstancesModule,
    MapPlaceInstanceJobsModule,
    MapPlaceInstanceJobOffersModule,
    PlayersModule,
    WalletModule,
    VehicleInstancesModule,
    VehicleInstanceJobsModule,
    UserPreferenceModule,
  ],
})
export class ApiModule {
}
