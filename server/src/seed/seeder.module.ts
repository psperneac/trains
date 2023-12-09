import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { ApiModule } from '../app/api/api.module';
import { VehicleType } from '../app/api/vehicles/vehicle-type.entity';
import { AuthenticationModule } from '../authentication/authentication.module';
import { DatabaseModule } from '../database/database.module';
import { Seeder } from './seeder';
import { VehicleTypeSeederService } from './vehicle-type-seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      validationSchema: Joi.object({
        MYSQL_HOST: Joi.string().required(),
        MYSQL_PORT: Joi.number().required(),
        MYSQL_USER: Joi.string().required(),
        MYSQL_PASSWORD: Joi.string().required(),
        MYSQL_DB: Joi.string().required(),
        POSTGRESQL_HOST: Joi.string().required(),
        POSTGRESQL_PORT: Joi.number().required(),
        POSTGRESQL_USER: Joi.string().required(),
        POSTGRESQL_PASSWORD: Joi.string().required(),
        POSTGRESQL_DB: Joi.string().required(),
        MONGO_USERNAME: Joi.string().required(),
        MONGO_PASSWORD: Joi.string().required(),
        MONGO_DATABASE: Joi.string().required(),
        MONGO_HOST: Joi.string().required(),
        PORT: Joi.number(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    AuthenticationModule,
    ApiModule,
    TypeOrmModule.forFeature([VehicleType])],
  providers: [
    Logger,
    Seeder,
    VehicleTypeSeederService],
})
export class SeederModule {
}
