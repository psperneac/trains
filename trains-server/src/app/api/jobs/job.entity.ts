import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { Place } from '../places/place.entity';

@Entity({ name: 'jobs' })
export class Job extends AbstractEntity {
  @Column('varchar', { length: 20 })
  @Expose()
  type: string;

  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;

  @ManyToOne(type => Place, { eager: true })
  @JoinColumn({ name: 'start' })
  @Expose()
  start: Place;

  @ManyToOne(type => Place, { eager: true })
  @JoinColumn({ name: 'end' })
  @Expose()
  end: Place;

  @Column()
  @Expose()
  load: number;

  @Column({ name: 'pay_type' })
  @Expose()
  payType: string;

  @Column()
  @Expose()
  pay: number;

  @Column({ name: 'start_time' })
  @Expose()
  startTime: Date;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface JobDto {
  id: string;
  name: string;
  description: string;
  type: string;
  startId: string;
  endId: string;
  load: number;
  payType: string;
  pay: number;
  startTime: Date;
  content: any;
}
