import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Job, JobDto } from '../jobs/job.entity';
import { MapTemplate } from '../maps/map-template.entity';
import { MapPlaceInstance } from './map-place-instance.entity';

@Entity({ name: 'map_place_instance_jobs' })
export class MapPlaceInstanceJob extends Job {
  @ManyToOne(type => MapPlaceInstance, { eager: true })
  @JoinColumn({ name: 'map_place_instance_id' })
  @Expose()
  mapPlaceInstance: MapPlaceInstance;

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

export interface MapPlaceInstanceJobDto extends JobDto {
  mapPlaceInstanceId: string;
  playerId: string;
  mapId: string;
  content: any;
}
