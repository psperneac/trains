import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';

@Entity({ name: 'places' })
export class Place extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  type: string;

  @Column()
  lat: number;

  @Column({ name: 'lng' })
  long: number;
}

export interface PlaceDto {
  id: string;
  name: string;
  description: string;
  type: string;
  lat: number;
  long: number;
}

export interface CreatePlaceDto {
  name: string;
  description: string;
  type: string;
  lat: number;
  long: number;
}

export interface UpdatePlaceDto {
  id: string;
  name: string;
  description: string;
  type: string;
  lat: number;
  long: number;
}
