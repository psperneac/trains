import { Column, Entity } from 'typeorm';
import { Expose } from 'class-transformer';
import { TABLES } from '../../../database/database.module';
import { AbstractEntity } from '../../../utils/abstract.entity';

@Entity({ name: 'users' })
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
