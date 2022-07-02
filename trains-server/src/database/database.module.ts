import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Post from '../app/api/posts/posts.entity';
import User from '../app/api/users/users.entity';
import Place from '../app/api/places/place.entity';
import Translation from '../app/api/translations/entities/translation.entity';

export const ENTITIES = [Post, Place, User, Translation];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get('MYSQL_HOST'),
          port: configService.get('MYSQL_PORT'),
          username: configService.get('MYSQL_USER'),
          password: configService.get('MYSQL_PASSWORD'),
          database: configService.get('MYSQL_DB'),
          entities: ENTITIES,
          synchronize: false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
