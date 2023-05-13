import { Injectable } from "@nestjs/common";
import { Expose } from "class-transformer";
import { Column, Entity } from "typeorm";
import { AbstractDto } from "../../../utils/abstract-dto";
import { AbstractDtoMapper } from "../../../utils/abstract-dto-mapper";
import { AbstractEntity } from "../../../utils/abstract.entity";

@Entity({ name: 'VEHICLES' })
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

  @Column('int', { name: 'ENGINE_MAX' })
  @Expose()
  engineMax: number;

  @Column('int', { name: 'ENGINE_LOAD' })
  @Expose()
  engineLoad: number;

  @Column('int', { name: 'ENGINE_FUEL' })
  @Expose()
  engineFuel: number;

  @Column('int', { name: 'AUX_MAX' })
  @Expose()
  auxMax: number;

  @Column('int', { name: 'AUX_LOAD' })
  @Expose()
  auxLoad: number;

  @Column('int', { name: 'AUX_FUEL' })
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
