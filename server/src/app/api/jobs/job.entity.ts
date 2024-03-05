import { Expose } from 'class-transformer';
import { Column, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { MapPlace } from '../places/map-place.entity';

export abstract class Job extends AbstractEntity {
  @Column('varchar', { length: 20 })
  @Expose()
  type: string;

  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;

  @ManyToOne(_type => MapPlace, { eager: true })
  @JoinColumn({ name: 'start' })
  @Expose()
  start: MapPlace;

  @ManyToOne(_type => MapPlace, { eager: true })
  @JoinColumn({ name: 'end' })
  @Expose()
  end: MapPlace;

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
  startTime: string;
  content: any;
}
