import { Expose } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';

@Entity({ name: 'VEHICLE_TYPES' })
export class VehicleType extends AbstractEntity {
  @Column('varchar', { length: 20 })
  @Expose()
  type: string;

  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export class VehicleTypeDto {
  id: string;
  type: string;
  name: string;
  description: string;
  content: any;
}
