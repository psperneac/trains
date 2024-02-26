import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { MapTemplate } from '../maps/map-template.entity';
import { Place } from '../places/place.entity';
import { Player } from '../players/player.entity';
import { VehicleInstanceJob } from './vehicle-instance-job.entity';
import { Vehicle, VehicleDto } from './vehicle.entity';

@Entity({ name: 'vehicle_instances' })
export class VehicleInstance extends AbstractEntity {
  @ManyToOne(_type => Vehicle, { eager: true })
  @JoinColumn({ name: 'vehicle_id' })
  @Expose()
  vehicle: Vehicle;

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

  @ManyToOne(_type => Player, { eager: true })
  @JoinColumn({ name: 'player_id' })
  @Expose()
  player: Player;

  @ManyToOne(_type => MapTemplate, { eager: true })
  @JoinColumn({ name: 'map_id' })
  @Expose()
  map: MapTemplate;

  @OneToMany(_type => VehicleInstanceJob, job => job.vehicleInstance)
  @Expose()
  jobs: VehicleInstanceJob[];

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface VehicleInstanceDto {
  id: string;
  vehicleId: string;
  startId: string;
  endId: string;
  startTime: string;
  endTime: string;
  playerId: string;
  mapId: string;
  jobs: string[];
  content: any;
}
