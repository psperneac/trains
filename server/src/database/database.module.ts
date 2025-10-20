import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Translation } from '../app/api/support/translations.module';
import { User } from '../app/api/support/users.module';
import { environment } from '../environments/environment';
import { Game } from 'src/app/api/games.module';
import { Place } from 'src/app/api/places.module';
import { Vehicle } from 'src/app/api/vehicles.module';
import { PlaceConnection } from 'src/app/api/place-connection.module';
import { PlaceInstance } from 'src/app/api/place-instance.module';
import { VehicleInstance } from 'src/app/api/vehicle-instances.module';
import { Job } from 'src/app/api/jobs.module';
import { Player } from 'src/app/api/support/players.module';
import { Wallet } from 'src/app/api/support/wallets.module';

export const TABLES = {
  USERS: 'users',
  JOBS: 'jobs',
  PLACE_CONNECTIONS: 'place_connections',
  PLACES: 'places',
  POSTS: 'posts',
  TRANSLATIONS: 'translations',
  VEHICLE_TYPES: 'vehicle_types',
  VEHICLES: 'vehicles',
  PLACE_TYPES: 'place_types',
  PLACE_CONNECTION_INSTANCES: 'place_connection_instances',
  PLACE_INSTANCES: 'place_instances',
  PLACE_INSTANCE_JOBS: 'place_instance_jobs',
  PLACE_INSTANCE_JOB_OFFERS: 'place_instance_job_offers',
  VEHICLE_INSTANCES: 'vehicle_instances',
  VEHICLE_INSTANCE_JOBS: 'vehicle_instance_jobs',
  MAP_TEMPLATES: 'map_templates',
  MAP_PLACES: 'map_places',
  MAP_PLACE_CONNECTIONS: 'map_place_connections',
  PLAYERS: 'players',
  USER_PREFERENCES: 'user_preferences',
  WALLETS: 'wallets'
};

export const ENTITIES = [
  User,
  Translation,
  Game,
  Place,
  Vehicle,
  PlaceConnection,
  PlaceInstance,
  VehicleInstance,
  Job,
  Player,
  Wallet,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('environment', environment);

        const username = configService.get('MONGO_USERNAME');
        const password = configService.get('MONGO_PASSWORD');
        const database = configService.get('MONGO_DATABASE');
        const host = configService.get('MONGO_HOST');
        const url = `mongodb://${username}:${password}@${host}/${database}?ssl=false`;

        return {
          type: 'mongodb',
          url,
          database: configService.get('MONGO_DATABASE'),
          entities: ENTITIES,
          synchronize: !environment.production
        };
      }
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const username = configService.get('MONGO_USERNAME');
        const password = configService.get('MONGO_PASSWORD');
        const database = configService.get('MONGO_DATABASE');
        const host = configService.get('MONGO_HOST');

        // https://mongoosejs.com/docs/connections.html
        const config = {
          uri: `mongodb://${username}:${password}@${host}/${database}?ssl=false`,
          dbName: database,
        };

        return config;
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
