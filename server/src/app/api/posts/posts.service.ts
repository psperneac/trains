import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreatePostDto, UpdatePostDto } from '../../../models/posts.model';

import { Post, PostDocument } from './posts.schema';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async getAll() {
    return await this.postModel.find().exec();
  }

  async getOne(uuid: string) {
    const post = await this.postModel.findById(uuid).exec();
    if (post) {
      return post;
    }
    throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
  }

  async update(uuid: string, post: UpdatePostDto) {
    const updatedPost = await this.postModel.findByIdAndUpdate(uuid, post).setOptions({ overwrite: true, new: true });

    if (updatedPost) {
      return updatedPost;
    }

    throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
  }

  create(post: CreatePostDto) {
    const newPost = new this.postModel(post);
    return newPost.save();
  }

  async delete(uuid: string) {
    const deleteResponse = await this.postModel.findByIdAndDelete(uuid);
    if (!deleteResponse) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    return true;
  }
}
