import { PostsModule } from './posts/posts.module';
import { PlacesModule } from './places/places.module';
import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';
import { TranslationsModule } from './translations/translations.module';
import { VehicleTypeModule } from './vehicle-types/vehicle-type.module';
import {PlaceTypesModule} from "./place-types/place-types.module";

@Module({
  imports: [
    PlacesModule,
    PostsModule,
    UsersModule,
    TranslationsModule,
    VehicleTypeModule,
    PlaceTypesModule,
  ],
})
export class ApiModule {
}
