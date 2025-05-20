import { Module } from '@nestjs/common';

import { MapTemplateModule } from './maps/map-template.module';
import { PlaceConnectionInstancesModule } from './places/map-place-connection-instance.module';
import { MapPlaceConnectionsModule } from './places/map-place-connections.module';
import { MapPlaceInstanceJobOffersModule } from './places/map-place-instance-job-offer.module';
import { MapPlaceInstanceJobsModule } from './places/map-place-instance-job.module';
import { MapPlaceInstancesModule } from './places/map-place-instance.module';
import { MapPlacesModule } from './places/map-place.module';
import { PlaceConnectionsModule } from './places/place-connection.module';
import { PlaceTypeModule } from './places/place-type.module';
import { PlacesModule } from './places/place.module';
import { PlayersModule } from './players/players.module';
import { PostsModule } from './posts/posts.module';
import { TranslationsModule } from './translations/translations.module';
import { UserPreferenceModule } from './users/user-preference.module';
import { UsersModule } from './users/users.module';
import { MapVehicleInstanceJobsModule } from './vehicles/map-vehicle-instance-job.module';
import { MapVehicleInstancesModule } from './vehicles/map-vehicle-instance.module';
import { MapVehiclesModule } from './vehicles/map-vehicles.module';
import { VehicleTypesModule } from './vehicles/vehicle-types.module';
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
    MapVehicleInstancesModule,
    MapVehicleInstanceJobsModule,
    UserPreferenceModule,
    MapVehiclesModule,

    PlayersModule
  ]
})
export class ApiModule {}
