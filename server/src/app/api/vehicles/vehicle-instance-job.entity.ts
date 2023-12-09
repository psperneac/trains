import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Job, JobDto } from '../jobs/job.entity';
import { Player } from '../players/player.entity';
import { VehicleInstance } from './vehicle-instance.entity';

@Entity({name: 'vehicle_instance_jobs'})
export class VehicleInstanceJob extends Job {
  @ManyToOne(type => VehicleInstance, {eager: true})
  @JoinColumn({name: 'vehicle_instance_id'})
  @Expose()
  vehicleInstance: VehicleInstance;

  @ManyToOne(type => Player, {eager: true})
  @JoinColumn({name: 'player_id'})
  @Expose()
  player: Player;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface VehicleInstanceJobDto extends JobDto {
  vehicleInstanceId: string;
  playerId: string;
  content: any;
}
