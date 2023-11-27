import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { User } from './users.entity';

@Entity({ name: 'user_preferences' })
export class UserPreference extends AbstractEntity {

  @OneToOne(_type => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface UserPreferenceDto {
  id: string;
  userId: string;
  content: any;
}
