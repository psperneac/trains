import { JobsModule } from './jobs/jobs.module';
import { MapPlaceConnectionsModule } from './places/map-place-connections.module';
import { MapPlacesModule } from './places/map-places.module';
import { MapTemplateModule } from './maps/map-template.module';
import { PlacesModule } from './places/place.module';
import { MapVehiclesModule } from './vehicles/map-vehicles.module';
import { PlaceConnectionInstancesModule } from './places/map-place-connection-instance.module';
import { PlaceConnectionsModule } from './places/place-connection.module';
import { MapPlaceInstanceJobOffersModule } from './places/map-place-instance-job-offer.module';
import { MapPlaceInstanceJobsModule } from './places/map-place-instance-job.module';
import { MapPlaceInstancesModule } from './places/map-place-instance.module';
import { PlayersModule } from './players/player.module';
import { WalletModule } from './players/wallet.module';
import { PostsModule } from './posts/posts.module';
import { UserPreferenceModule } from './users/user-preference.module';
import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';
import { TranslationsModule } from './translations/translations.module';
import { VehicleInstanceJobsModule } from './vehicles/map-vehicle-instance-job.module';
import { MapVehicleInstancesModule } from './vehicles/map-vehicle-instance.module';
import { VehicleTypesModule } from './vehicles/vehicle-types.module';
import { PlaceTypeModule } from "./places/place-type.module";
import { VehicleModule } from './vehicles/vehicle.module';

@Module({
  imports: [
    PlacesModule,
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
    MapVehicleInstancesModule,
    VehicleInstanceJobsModule,
    UserPreferenceModule,
    MapVehiclesModule,
  ],
})
export class ApiModule {
}
