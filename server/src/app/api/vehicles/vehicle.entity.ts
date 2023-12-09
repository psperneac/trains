import { Expose } from "class-transformer";
import { Column, Entity } from "typeorm";
import { AbstractDto } from "../../../utils/abstract-dto";
import { AbstractEntity } from "../../../utils/abstract.entity";

@Entity({ name: 'vehicles' })
export class Vehicle extends AbstractEntity {
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

  @Column('int', { name: 'engine_max' })
  @Expose()
  engineMax: number;

  @Column('int', { name: 'engine_load' })
  @Expose()
  engineLoad: number;

  @Column('int', { name: 'engine_fuel' })
  @Expose()
  engineFuel: number;

  @Column('int', { name: 'aux_max' })
  @Expose()
  auxMax: number;

  @Column('int', { name: 'aux_load' })
  @Expose()
  auxLoad: number;

  @Column('int', { name: 'aux_fuel' })
  @Expose()
  auxFuel: number;

  @Column('int')
  @Expose()
  speed: number;
}

export class VehicleDto implements AbstractDto {
  id: string;
  type: string;
  name: string;
  description: string;
  content: any;

  engineMax: number;
  engineLoad: number;
  engineFuel: number;

  auxMax: number;
  auxLoad: number;
  auxFuel: number;

  speed: number;
}
