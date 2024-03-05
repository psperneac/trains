import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Job, JobDto } from '../jobs/job.entity';
import { MapTemplate } from '../maps/map-template.entity';
import { Player } from '../players/player.entity';
import { MapVehicleInstance } from './map-vehicle-instance.entity';

@Entity({name: 'vehicle_instance_jobs'})
export class VehicleInstanceJob extends Job {
  @ManyToOne(type => MapVehicleInstance, {eager: true})
  @JoinColumn({name: 'vehicle_instance_id'})
  @Expose()
  vehicleInstance: MapVehicleInstance;

  @ManyToOne(type => Player, {eager: true})
  @JoinColumn({name: 'player_id'})
  @Expose()
  player: Player;

  @ManyToOne(type => MapTemplate, {eager: true})
  @JoinColumn({name: 'map_id'})
  @Expose()
  map: MapTemplate;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface VehicleInstanceJobDto extends JobDto {
  vehicleInstanceId: string;
  playerId: string;
  mapId: string;
  content: any;
}
