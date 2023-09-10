import { Expose } from 'class-transformer';
import { Column, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import User from '../users/users.entity';

export class Player extends AbstractEntity {
  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;

  @ManyToOne(type => User, { eager: true })
  @JoinColumn({ name: "USER" })
  user: User;
}
