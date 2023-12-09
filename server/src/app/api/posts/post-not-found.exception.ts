import { NotFoundException } from '@nestjs/common';

class PostNotFoundException extends NotFoundException {
  constructor(postId: string) {
    super(`Post with id ${postId} not found`);
  }
}
