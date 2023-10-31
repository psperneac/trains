import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Job } from '../app/api/jobs/job.entity';
import { PlaceConnection } from '../app/api/place-connections/place-connection.entity';
import User from '../app/api/users/users.entity';
import { Place } from '../app/api/places/place.entity';
import { Translation } from '../app/api/translations/translation.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { PlaceType } from '../app/api/place-types/place-type.entity';
import { VehicleType } from '../app/api/vehicle-types/vehicle-type.entity';
import { Vehicle } from '../app/api/vehicles/vehicle.entity';

export const TABLES = {
  USERS: 'users',
  JOBS: 'jobs',
  PLACE_CONNECTIONS: 'place_connections',
  PLACES: 'places',
  POSTS: 'posts',
  TRANSLATIONS: 'translations',
  VEHICLE_TYPES: 'vehicle_types',
  VEHICLES: 'vehicles'
}

export const ENTITIES = [
  Place,
  User,
  Translation,
  PlaceType,
  VehicleType,
  Vehicle,
  PlaceConnection,
  Job,
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
