import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Job, JobDto } from '../jobs/job.entity';
import { MapTemplate } from '../maps/map-template.entity';

import { MapVehicleInstance } from './map-vehicle-instance.entity';

@Entity({ name: 'map_vehicle_instance_jobs' })
export class MapVehicleInstanceJob extends Job {
  @ManyToOne(type => MapVehicleInstance, { eager: true })
  @JoinColumn({ name: 'map_vehicle_instance_id' })
  @Expose()
  mapVehicleInstance: MapVehicleInstance;

  @Column({ name: 'player_id' })
  @Expose()
  playerId: string;

  @ManyToOne(type => MapTemplate, { eager: true })
  @JoinColumn({ name: 'map_id' })
  @Expose()
  map: MapTemplate;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface MapVehicleInstanceJobDto extends JobDto {
  mapVehicleInstanceId: string;
  playerId: string;
  mapId: string;
  content: any;
}
