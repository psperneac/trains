import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Job, JobDto } from '../jobs/job.entity';
import { Player } from '../players/player.entity';
import { PlaceInstance } from './place-instance.entity';

@Entity({ name: 'place_instance_jobs' })
export class PlaceInstanceJob extends Job {
  @ManyToOne(type => PlaceInstance, { eager: true })
  @JoinColumn({ name: 'place_instance_id' })
  @Expose()
  placeInstance: PlaceInstance;

  @ManyToOne(type => Player, {eager: true})
  @JoinColumn({name: 'player_id'})
  @Expose()
  player: Player;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface PlaceInstanceJobDto extends JobDto {
  placeInstanceId: string;
  playerId: string;
  content: any;
}
