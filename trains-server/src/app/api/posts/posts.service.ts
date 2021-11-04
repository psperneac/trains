import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Post from './posts.entity';
import { CreatePostDto, UpdatePostDto } from '../../../models/posts.model';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private repository: Repository<Post>,
  ) {}

  getAll() {
    return this.repository.find();
  }

  async getOne(uuid: string) {
    const post = await this.repository.findOne(uuid);
    if (post) {
      return post;
    }
    throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
  }

  async update(uuid: string, post: UpdatePostDto) {
    await this.repository.update(uuid, post);
    const updatedPost = await this.repository.findOne(uuid);
    if (updatedPost) {
      return updatedPost;
    }
    throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
  }

  async create(post: CreatePostDto) {
    const newPost = await this.repository.create(post);
    await this.repository.save(newPost);
    return newPost;
  }

  async delete(uuid: string) {
    const deleteResponse = await this.repository.delete(uuid);
    if (!deleteResponse.affected) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    return true;
  }
}
