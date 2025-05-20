import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../utils/abstract.entity';

import { MapPlaceInstanceJobOffer } from './map-place-instance-job-offer.entity';
import { MapPlaceInstanceJob } from './map-place-instance-job.entity';
import { MapPlace } from './map-place.entity';

@Entity({ name: 'map_place_instances' })
export class MapPlaceInstance extends AbstractEntity {
  @ManyToOne(type => MapPlace, { eager: true })
  @JoinColumn({ name: 'map_place_id' })
  @Expose()
  mapPlace: MapPlace;

  @Column({ name: 'player_id' })
  @Expose()
  playerId: string;

  @OneToMany(type => MapPlaceInstanceJob, job => job.mapPlaceInstance)
  @Expose()
  jobs: MapPlaceInstanceJob[];

  @OneToMany(type => MapPlaceInstanceJobOffer, job => job.mapPlaceInstance)
  @Expose()
  jobOffers: MapPlaceInstanceJobOffer[];

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface MapPlaceInstanceDto {
  id: string;
  mapPlaceId: string;
  playerId: string;

  jobs: string[];
  jobOffers: string[];

  content: any;
}
