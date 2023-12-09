import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, UseFilters } from '@nestjs/common';
import { PostsService } from './posts.service';
import { LoggedIn } from '../../../authentication/authentication.guard';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { CreatePostDto, UpdatePostDto } from '../../../models/posts.model';
import ParamsWithMongoId from '../../../utils/params-with-mongo-id';

@Controller('posts')
@UseGuards(LoggedIn)
@UseFilters(AllExceptionsFilter)
export class PostsController {
  constructor(private readonly postsService: PostsService) {
  }

  @Get()
  getAllPosts() {
    const ret = this.postsService.getAll();
    return ret;
  }

  @Get(':id')
  getPostById(@Param() {id}: ParamsWithMongoId) {
    return this.postsService.getOne(id);
  }

  @Post()
  async createPost(@Body() post: CreatePostDto) {
    return this.postsService.create(post);
  }

  @Put(':id')
  async replacePost(@Param() { id }: ParamsWithMongoId, @Body() post: UpdatePostDto) {
    return this.postsService.update(id, post);
  }

  @Delete(':id')
  async deletePost(@Param() {id}: ParamsWithMongoId) {
    return this.postsService.delete(id);
  }
}
