import { Expose } from 'class-transformer';
import { Column, JoinColumn, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { Map } from '../maps/map-template.entity';
import { User } from '../users/users.entity';

export class Player extends AbstractEntity {
  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;

  @OneToOne((_type) => User, { eager: true })
  @JoinColumn({ name: 'USER_ID' })
  user: User;

  @OneToOne((_type) => Map, { eager: true })
  @JoinColumn({ name: 'MAP_ID' })
  map: Map;

}
