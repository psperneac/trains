import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../utils/abstract.entity';
import { MapTemplate } from '../maps/map-template.entity';

import { Place } from '../places/place.module';
import { MapVehicleInstanceJob } from './map-vehicle-instance-job.entity';
import { MapVehicle } from './map-vehicle.entity';

@Entity({ name: 'map_vehicle_instances' })
export class MapVehicleInstance extends AbstractEntity {
  @ManyToOne(_type => MapVehicle, { eager: true })
  @JoinColumn({ name: 'map_vehicle_id' })
  @Expose()
  mapVehicle: MapVehicle;

  @ManyToOne(_type => Place, { eager: true })
  @JoinColumn({ name: 'start_id' })
  @Expose()
  start: Place;

  @ManyToOne(_type => Place, { eager: true })
  @JoinColumn({ name: 'end_id' })
  @Expose()
  end: Place;

  @Column({ name: 'start_time' })
  @Expose()
  startTime: Date;

  @Column({ name: 'end_time' })
  @Expose()
  endTime: Date;

  @Column({ name: 'player_id' })
  @Expose()
  playerId: string;

  @ManyToOne(_type => MapTemplate, { eager: true })
  @JoinColumn({ name: 'map_id' })
  @Expose()
  map: MapTemplate;

  @OneToMany(_type => MapVehicleInstanceJob, job => job.mapVehicleInstance)
  @Expose()
  jobs: MapVehicleInstanceJob[];

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface MapVehicleInstanceDto {
  id: string;
  mapVehicleId: string;
  startId: string;
  endId: string;
  startTime: string;
  endTime: string;
  playerId: string;
  mapId: string;
  jobs: string[];
  content: any;
}
