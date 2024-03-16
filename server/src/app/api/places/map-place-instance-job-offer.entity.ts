import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Job, JobDto } from '../jobs/job.entity';
import { MapTemplate } from '../maps/map-template.entity';
import { Player } from '../players/player.entity';
import { MapPlaceInstance } from './map-place-instance.entity';

@Entity({ name: 'map_place_instance_job_offers' })
export class MapPlaceInstanceJobOffer extends Job {
  @ManyToOne(type => MapPlaceInstance, { eager: true })
  @JoinColumn({ name: 'map_place_instance_id' })
  @Expose()
  mapPlaceInstance: MapPlaceInstance;

  @ManyToOne(type => Player, {eager: true})
  @JoinColumn({name: 'player_id'})
  @Expose()
  player: Player;

  @ManyToOne(type => MapTemplate, {eager: true})
  @JoinColumn({name: 'map_id'})
  @Expose()
  map: MapTemplate;

  @Column({ name: 'job_offer_expiry' })
  @Expose()
  jobOfferExpiry: Date;

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface MapPlaceInstanceJobOfferDto extends JobDto {
  mapPlaceInstanceId: string;
  playerId: string;
  mapId: string;
  jobOfferExpiry: string;
  content: any;
}
