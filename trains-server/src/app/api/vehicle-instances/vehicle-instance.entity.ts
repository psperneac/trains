import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { Place } from '../places/place.entity';
import { Player } from '../players/player.entity';
import { Vehicle } from '../vehicles/vehicle.entity';

@Entity({ name: 'vehicle_instances' })
export class VehicleInstance extends AbstractEntity {
  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;

  @ManyToOne(type => Vehicle, { eager: true })
  @JoinColumn({ name: 'vehicle_id' })
  @Expose()
  vehicle: Vehicle;

  @ManyToOne(type => Place, { eager: true })
  @JoinColumn({ name: 'start_id' })
  @Expose()
  start: Place;

  @ManyToOne(type => Place, { eager: true })
  @JoinColumn({ name: 'end_id' })
  @Expose()
  end: Place;

  @Column({ name: 'start_time' })
  @Expose()
  startTime: Date;

  @Column({ name: 'end_time' })
  @Expose()
  endTime: Date;

  @ManyToOne(type => Player, { eager: true })
  @JoinColumn({ name: 'player_id' })
  @Expose()
  player: Player;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}
