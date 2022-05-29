import { Column, Entity } from 'typeorm';
import { Expose } from 'class-transformer';
import { AbstractEntity } from '../../../utils/abstract.entity';

@Entity({ name: 'USERS' })
class User extends AbstractEntity {
  @Column()
  @Expose()
  public username: string;

  @Column()
  public password: string;

  @Column()
  @Expose()
  public email: string;

  @Column()
  @Expose()
  public scope: string;
}

export default User;
