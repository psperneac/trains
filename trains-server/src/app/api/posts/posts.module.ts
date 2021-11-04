import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import Post from './posts.entity';
import { AuthenticationModule } from '../../../authentication/authentication.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), AuthenticationModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
