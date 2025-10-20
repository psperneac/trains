import { Module } from '@nestjs/common';

import { JobsModule } from './jobs.module';
import { PlaceInstancesModule } from './place-instance.module';
import { PlaceConnectionsModule } from './place-connection.module';
import { PlaceTypeModule } from './place-type.module';
import { PlacesModule } from './places.module';
import { PostsModule } from './posts/posts.module';
import { TranslationsModule } from './support/translations.module';
import { UsersModule } from './support/users.module';
import { VehicleTypesModule } from './vehicle-types.module';
import { VehiclesModule } from './vehicles.module';
import { GamesModule } from './games.module';
import { PlayersModule } from './support/players.module';
import { WalletsModule } from './support/wallets.module';

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
    PlaceInstancesModule,
    PlayersModule,
    JobsModule,
    GamesModule,
    WalletsModule
  ]
})
export class ApiModule {}
