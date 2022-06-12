import { PostsModule } from './posts/posts.module';
import { PlacesModule } from './places/places.module';
import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';
import { TranslationsModule } from './translations/translations.module';

@Module({
  imports: [PlacesModule, PostsModule, UsersModule, TranslationsModule],
})
export class ApiModule {}
