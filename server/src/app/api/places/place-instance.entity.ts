import { Expose } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../utils/abstract.entity';
import { Player } from '../players/player.entity';
import { PlaceInstanceJobOffer } from './place-instance-job-offer.entity';
import { PlaceInstanceJob } from './place-instance-job.entity';
import { Place } from './place.entity';

@Entity({ name: 'place_instances' })
export class PlaceInstance extends AbstractEntity {
  @ManyToOne(type => Place, { eager: true })
  @JoinColumn({ name: 'place_id' })
  @Expose()
  place: Place;

  @ManyToOne(type => Player, { eager: true })
  @JoinColumn({ name: 'player_id' })
  @Expose()
  player: Player;

  @OneToMany(type => PlaceInstanceJob, job => job.placeInstance)
  @Expose()
  jobs: PlaceInstanceJob[];

  @OneToMany(type => PlaceInstanceJobOffer, job => job.placeInstance)
  @Expose()
  jobOffers: PlaceInstanceJobOffer[];

  @Column({ type: 'json' })
  @Expose()
  content: any;
}

export interface PlaceInstanceDto {
  id: string;
  placeId: string;
  playerId: string;

  jobs: string[];
  jobOffers: string[];

  content: any;
}
