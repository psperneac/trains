import { PlaceConnectionsModule } from './place-connections/place-connections.module';
import { PostsModule } from './posts/posts.module';
import { PlacesModule } from './places/places.module';
import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';
import { TranslationsModule } from './translations/translations.module';
import { VehicleTypesModule } from './vehicle-types/vehicle-types.module';
import {PlaceTypeModule} from "./place-types/place-type.module";
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
