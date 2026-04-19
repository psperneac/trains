import { Injectable, OnModuleInit } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { PlaceInstancesService } from '../../api/place-instance.module';
import { PlaceInstance } from '../../api/place-instance.module';
import { PlacesService } from '../../api/places.module';
import { CargoTypes, CargoType } from '../../api/vehicles.module';
import { InMemorySchedulerService } from '../scheduler/in-memory-scheduler.service';

/**
 * Job offer representing a cargo delivery opportunity.
 * These are ephemeral - generated periodically and not persisted.
 */
export interface GameJobOffer {
  /** Temporary ID for frontend keying */
  id: string;
  /** Type of cargo being transported */
  cargoType: CargoType;
  /** Origin place template ID */
  startPlaceId: string;
  /** Destination place template ID */
  endPlaceId: string;
  /** Destination place name (for display) */
  destinationName?: string;
  /** Amount of cargo */
  load: number;
  /** Payment amount */
  pay: number;
  /** Payment currency type */
  payType: 'GOLD' | 'GEMS';
  /** When the offer expires */
  expiresAt: Date;
}

/**
 * Result of generating job offers for a place.
 */
export interface GenerateOffersResult {
  placeInstanceId: string;
  offers: GameJobOffer[];
}

/**
 * Service for generating job offers at player-owned places.

 * The JobOfferService manages job offers that appear at owned places:
 * - Jobs only generate when player has 2+ places (need origin and destination)
 * - Jobs are generated between owned places (player to player)
 * - At Place X, jobs are: deliver TO other owned places
 * - All places refresh simultaneously via global tick
 *
 * Usage:
 * ```
 * const jobOffer = container.get(JobOfferService);
 *
 * // Generate offers for a specific place
 * const offers = await jobOffer.generateOffersForPlace(placeInstanceId);
 *
 * // Get job offers for all player's places
 * const allOffers = await jobOffer.getAllOffersForPlayer(playerId);
 * ```
 */
@Injectable()
export class JobOfferService implements OnModuleInit {
  /** Default refresh interval in milliseconds (5 minutes) */
  private static readonly DEFAULT_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

  /** Minimum jobs per destination */
  private static readonly MIN_JOBS_PER_DESTINATION = 0;

  /** Maximum jobs per destination */
  private static readonly MAX_JOBS_PER_DESTINATION = 2;

  /** Minimum cargo load */
  private static readonly MIN_LOAD = 10;

  /** Maximum cargo load */
  private static readonly MAX_LOAD = 100;

  /** Minimum payment */
  private static readonly MIN_PAY = 50;

  /** Maximum payment */
  private static readonly MAX_PAY = 500;

  constructor(
    private readonly placeInstancesService: PlaceInstancesService,
    private readonly placesService: PlacesService,
    private readonly schedulerService: InMemorySchedulerService
  ) {}

  /**
   * Initialize the global tick refresh on module load.
   * Schedules periodic refresh of all job offers.
   */
  onModuleInit() {
    this.scheduleGlobalRefresh();
  }

  /**
   * Schedule the next global refresh of all job offers.
   * All places refresh simultaneously on the same interval.
   */
  private scheduleGlobalRefresh() {
    this.schedulerService.schedule(
      'jobOffer:refresh',
      {},
      JobOfferService.DEFAULT_REFRESH_INTERVAL_MS
    );

    this.schedulerService.on('jobOffer:refresh', async () => {
      await this.refreshAllOffers();
      this.scheduleGlobalRefresh();
    });
  }

  /**
   * Refresh job offers for all player-owned places.
   * Called by the global tick.
   */
  private async refreshAllOffers(): Promise<void> {
    const allPlaceInstances = await this.placeInstancesService.findAll({ page: 1, pageSize: 1000 } as any);

    for (const placeInstance of allPlaceInstances.data) {
      try {
        await this.generateOffersForPlace(placeInstance._id.toString());
      } catch (error) {
        console.error(`Failed to refresh job offers for place ${placeInstance._id}:`, error);
      }
    }
  }

  /**
   * Generate job offers for a specific place instance.
   *
   * Jobs only generate when player has 2+ places (need origin and destination).
   * At Place X, jobs are: deliver TO other owned places.
   *
   * @param placeInstanceId - The place instance to generate offers for
   * @returns Array of job offers generated
   */
  async generateOffersForPlace(placeInstanceId: string): Promise<GameJobOffer[]> {
    const placeInst = await this.placeInstancesService.findOne(placeInstanceId);
    if (!placeInst) {
      return [];
    }

    const playerId = placeInst.playerId?.toString();
    if (!playerId) {
      return [];
    }

    const allOwned = await this.getOwnedPlaceInstances(playerId);

    // Need 2+ places for jobs
    if (allOwned.length < 2) {
      placeInst.jobOffers = [];
      await this.placeInstancesService.update(placeInstanceId, placeInst);
      return [];
    }

    const offers: GameJobOffer[] = [];
    const otherPlaces = allOwned.filter(
      (p) => p._id?.toString() !== placeInstanceId
    );

    for (const dest of otherPlaces) {
      // 0-2 jobs per destination pair
      const numJobs = this.randomInt(
        JobOfferService.MIN_JOBS_PER_DESTINATION,
        JobOfferService.MAX_JOBS_PER_DESTINATION + 1
      );

      const destName = dest.place?.name || 'Unknown';

      for (let i = 0; i < numJobs; i++) {
        const job = this.generateRandomJob(placeInst, dest);
        job.destinationName = destName;
        offers.push(job);
      }
    }

    // Update place instance with new offers
    placeInst.jobOffers = offers.map(o => ({
      name: `Delivery to ${o.destinationName}`,
      description: `Transport ${o.cargoType} to destination`,
      cargoType: o.cargoType,
      startId: o.startPlaceId,
      endId: o.endPlaceId,
      load: o.load,
      payType: o.payType,
      pay: o.pay,
      startTime: new Date(),
      content: {}
    }));
    await this.placeInstancesService.update(placeInstanceId, placeInst);

    return offers;
  }

  /**
   * Get all job offers for a player's places.
   *
   * @param playerId - The player's ID
   * @returns Map of placeInstanceId to array of job offers
   */
  async getAllOffersForPlayer(playerId: string): Promise<Map<string, GameJobOffer[]>> {
    const ownedPlaces = await this.getOwnedPlaceInstances(playerId);
    const offersMap = new Map<string, GameJobOffer[]>();

    for (const place of ownedPlaces) {
      const placeId = place._id?.toString();
      if (placeId && place.jobOffers) {
        const offers: GameJobOffer[] = place.jobOffers.map(jo => ({
          id: new ObjectId().toString(),
          cargoType: jo.cargoType as CargoType,
          startPlaceId: jo.startId,
          endPlaceId: jo.endId,
          load: jo.load,
          pay: jo.pay,
          payType: jo.payType as 'GOLD' | 'GEMS',
          expiresAt: new Date(Date.now() + JobOfferService.DEFAULT_REFRESH_INTERVAL_MS)
        }));
        offersMap.set(placeId, offers);
      }
    }

    return offersMap;
  }

  /**
   * Get job offers for a specific place instance.
   *
   * @param placeInstanceId - The place instance ID
   * @returns Array of job offers
   */
  async getOffersForPlace(placeInstanceId: string): Promise<GameJobOffer[]> {
    const placeInst = await this.placeInstancesService.findOne(placeInstanceId);
    if (!placeInst || !placeInst.jobOffers) {
      return [];
    }

    return placeInst.jobOffers.map(jo => ({
      id: new ObjectId().toString(),
      cargoType: jo.cargoType as CargoType,
      startPlaceId: jo.startId,
      endPlaceId: jo.endId,
      load: jo.load,
      pay: jo.pay,
      payType: jo.payType as 'GOLD' | 'GEMS',
      expiresAt: new Date(Date.now() + JobOfferService.DEFAULT_REFRESH_INTERVAL_MS)
    }));
  }

  /**
   * Generate a random job offer between two places.
   *
   * @param source - Source place instance
   * @param dest - Destination place instance
   * @returns Generated job offer
   */
  private generateRandomJob(source: PlaceInstance, dest: PlaceInstance): GameJobOffer {
    const sourcePlace = source.place;
    const destPlace = dest.place;

    return {
      id: new ObjectId().toString(),
      cargoType: this.randomCargoType(),
      startPlaceId: sourcePlace?._id?.toString() || '',
      endPlaceId: destPlace?._id?.toString() || '',
      load: this.randomInt(JobOfferService.MIN_LOAD, JobOfferService.MAX_LOAD + 1),
      pay: this.randomInt(JobOfferService.MIN_PAY, JobOfferService.MAX_PAY + 1),
      payType: Math.random() > 0.1 ? 'GOLD' : 'GEMS', // 90% gold, 10% gems
      expiresAt: new Date(Date.now() + JobOfferService.DEFAULT_REFRESH_INTERVAL_MS)
    };
  }

  /**
   * Get all place instances owned by a player.
   *
   * @param playerId - The player's ID
   * @returns Array of place instances
   */
  private async getOwnedPlaceInstances(playerId: string): Promise<PlaceInstance[]> {
    const allPlaceInstances = await this.placeInstancesService.findAll({ page: 1, pageSize: 1000 } as any);
    return allPlaceInstances.data.filter(
      (pi) => pi.playerId?.toString() === playerId
    );
  }

  /**
   * Pick a random cargo type from the available options.
   *
   * @returns Random cargo type
   */
  private randomCargoType(): CargoType {
    const index = Math.floor(Math.random() * CargoTypes.length);
    return CargoTypes[index];
  }

  /**
   * Generate a random integer in range [min, max).
   *
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   * @returns Random integer
   */
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
