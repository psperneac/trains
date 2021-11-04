import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';

@Entity({ name: 'posts' })
class Post extends AbstractEntity {
  @Column()
  public title: string;

  @Column()
  public content: string;
}

export default Post;
