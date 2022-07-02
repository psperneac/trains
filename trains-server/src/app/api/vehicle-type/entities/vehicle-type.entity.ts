import { Column, Entity } from 'typeorm';
import { Expose } from 'class-transformer';

@Entity({ name: 'VEHICLE_TYPES' })
export class VehicleType {
  @Column('varchar', { length: 20 })
  @Expose()
  type: string;

  @Column('varchar', { length: 250 })
  @Expose()
  name: string;

  @Column('varchar', { length: 250 })
  @Expose()
  defaultName: string;

  @Column('varchar', { length: 250 })
  @Expose()
  description: string;

  @Column('varchar', { length: 2000 })
  @Expose()
  content: string;
}
