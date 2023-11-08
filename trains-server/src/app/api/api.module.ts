import { JobsModule } from './jobs/jobs.module';
import { PlaceConnectionsModule } from './places/place-connection.module';
import { PostsModule } from './posts/posts.module';
import { PlacesModule } from './places/places.module';
import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';
import { TranslationsModule } from './translations/translations.module';
import { VehicleTypesModule } from './vehicles/vehicle-types.module';
import {PlaceTypeModule} from "./places/place-type.module";
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [
    PlacesModule,
    PostsModule,
    UsersModule,
    TranslationsModule,
    VehicleTypesModule,
    PlaceTypeModule,
    VehiclesModule,
    PlaceConnectionsModule,
  ],
})
export class ApiModule {
}
