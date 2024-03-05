import { Expose } from 'class-transformer';
import { Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { Vehicle } from './vehicle.entity';
import { MapTemplate } from '../maps/map-template.entity';

@Entity({ name: 'map_vehicles' })
export class MapVehicle extends AbstractEntity {
  @OneToOne((_type) => Vehicle, { eager: true })
  @JoinColumn({ name: 'vehicle_id' })
  @Expose()
  vehicle: Vehicle;

  @ManyToOne(type => MapTemplate, { eager: true })
  @JoinColumn({ name: 'map_id' })
  @Expose()
  map: MapTemplate;
}

export interface MapVehicleDto {
  id: string;
  vehicleId: string;
  mapId: string;
}
