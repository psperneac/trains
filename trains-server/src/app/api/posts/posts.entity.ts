import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';

@Entity({ name: 'POSTS' })
class Post extends AbstractEntity {
  @Column()
  public title: string;

  @Column()
  public content: string;
}

export default Post;
