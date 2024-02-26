import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MapPlaceConnection } from '../app/api/maps/map-place-connection.entity';
import { MapPlace } from '../app/api/maps/map-place.entity';
import { MapTemplate } from '../app/api/maps/map-template.entity';
import { MapPlaceConnectionInstance } from '../app/api/places/map-place-connection-instance.entity';
import { PlaceConnection } from '../app/api/places/place-connection.entity';
import { MapPlaceInstanceJobOffer } from '../app/api/places/map-place-instance-job-offer.entity';
import { MapPlaceInstanceJob } from '../app/api/places/map-place-instance-job.entity';
import { MapPlaceInstance } from '../app/api/places/map-place-instance.entity';
import { Player } from '../app/api/players/player.entity';
import { Wallet } from '../app/api/players/wallet.entity';
import { UserPreference } from '../app/api/users/user-preference.entity';
import { User } from '../app/api/users/users.entity';
import { Place } from '../app/api/places/place.entity';
import { Translation } from '../app/api/translations/translation.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { PlaceType } from '../app/api/places/place-type.entity';
import { VehicleInstanceJob } from '../app/api/vehicles/vehicle-instance-job.entity';
import { VehicleInstance } from '../app/api/vehicles/vehicle-instance.entity';
import { VehicleType } from '../app/api/vehicles/vehicle-type.entity';
import { Vehicle } from '../app/api/vehicles/vehicle.entity';

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
  WALLETS: 'wallets',
}

export const ENTITIES = [
  Place,
  User,
  UserPreference,
  Translation,
  PlaceType,
  VehicleType,
  Vehicle,
  PlaceConnection,
  MapPlaceConnectionInstance,
  MapPlaceInstance,
  MapPlaceInstanceJob,
  MapPlaceInstanceJobOffer,
  VehicleInstance,
  VehicleInstanceJob,
  MapTemplate,
  MapPlace,
  MapPlaceConnection,

  Player,
  Wallet,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // return {
        //   type: 'mysql',
        //   host: configService.get('MYSQL_HOST'),
        //   port: configService.get('MYSQL_PORT'),
        //   username: configService.get('MYSQL_USER'),
        //   password: configService.get('MYSQL_PASSWORD'),
        //   database: configService.get('MYSQL_DB'),
        //   entities: ENTITIES,
        //   synchronize: false,
        // };
        return {
          type: 'postgres',
          host: configService.get('POSTGRESQL_HOST'),
          port: configService.get('POSTGRESQL_PORT'),
          username: configService.get('POSTGRESQL_USER'),
          password: configService.get('POSTGRESQL_PASSWORD'),
          database: configService.get('POSTGRESQL_DB'),
          entities: ENTITIES,
          synchronize: false,
        };
      },
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
