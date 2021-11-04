import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { LoggedIn } from '../../../authentication/authentication.guard';
import { ExceptionsLoggerFilter } from '../../../utils/exceptions-logger.filter';
import { CreatePostDto, UpdatePostDto } from '../../../models/posts.model';

@Controller('posts')
@UseGuards(LoggedIn)
@UseFilters(ExceptionsLoggerFilter)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getAllPosts() {
    return this.postsService.getAll();
  }

  @Get(':id')
  getPostById(@Param('id') id: string) {
    return this.postsService.getOne(id);
  }

  @Post()
  async createPost(@Body() post: CreatePostDto) {
    return this.postsService.create(post);
  }

  @Put(':id')
  async replacePost(@Param('id') id: string, @Body() post: UpdatePostDto) {
    return this.postsService.update(id, post);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    return this.postsService.delete(id);
  }
}
