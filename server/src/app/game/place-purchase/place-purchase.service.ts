import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { PlayersService } from '../../api/support/players.module';
import { PlacesService } from '../../api/places.module';
import { PlaceInstancesService } from '../../api/place-instance.module';
import { PlaceInstance } from '../../api/place-instance.module';
import { EconomyService, CurrencyType } from '../economy/economy.service';
import { MapRevealService } from '../map-reveal/map-reveal.service';
import { Place } from '../../api/places.module';

/**
 * DTO for purchasing a place.
 */
export class PurchasePlaceDto {
  placeId: string;
}

/**
 * Result of a place purchase operation.
 */
export interface PurchasePlaceResult {
  success: boolean;
  placeInstance?: PlaceInstance;
  error?: string;
}

/**
 * Service for handling place purchases.

 * The PlacePurchaseService manages the process of buying places on the map:
 * 1. Validates that the place exists and is available for purchase
 * 2. Checks if the player can afford the place
 * 3. Deducts the cost from player's wallet
 * 4. Creates a PlaceInstance for the player
 *
 * Usage:
 * ```
 * const purchaseService = container.get(PlacePurchaseService);
 *
 * // Purchase a place
 * const result = await purchaseService.purchasePlace(playerId, placeId);
 * if (!result.success) {
 *   console.log(result.error);
 * }
 * ```
 */
@Injectable()
export class PlacePurchaseService {
  constructor(
    private readonly playersService: PlayersService,
    private readonly placesService: PlacesService,
    private readonly placeInstancesService: PlaceInstancesService,
    private readonly economyService: EconomyService,
    private readonly mapRevealService: MapRevealService
  ) {}

  /**
   * Purchase a place for a player.
   *
   * @param playerId - The player's ID
   * @param placeId - The place template ID to purchase
   * @returns Result indicating success or failure with reason
   * @throws NotFoundException if player or place not found
   * @throws BadRequestException if place is not available or already owned
   */
  async purchasePlace(playerId: string, placeId: string): Promise<PurchasePlaceResult> {
    // 1. Validate player exists
    const player = await this.playersService.findOne(playerId);
    if (!player) {
      throw new NotFoundException(`Player not found: ${playerId}`);
    }

    // 2. Validate place exists
    const place = await this.placesService.findOne(placeId);
    if (!place) {
      throw new NotFoundException(`Place not found: ${placeId}`);
    }

    // 3. Check if player already owns this place
    const ownedPlaceInstances = await this.mapRevealService.getOwnedPlaceInstances(playerId);
    const alreadyOwned = ownedPlaceInstances.some(
      pi => pi.placeId?.toString() === placeId
    );
    if (alreadyOwned) {
      return {
        success: false,
        error: 'You already own this place'
      };
    }

    // 4. Check if place is available (connected to owned places)
    const availablePlaces = await this.mapRevealService.getAvailablePlaces(playerId);
    const isAvailable = availablePlaces.some(p => p._id?.toString() === placeId);
    if (!isAvailable) {
      return {
        success: false,
        error: 'This place is not available for purchase. You can only buy places connected to ones you own.'
      };
    }

    // 5. Check affordability - deduct gold first, then gems if needed
    const priceGold = place.priceGold ?? 1000;
    const priceGems = place.priceGems ?? 0;

    // Try to deduct gold
    if (priceGold > 0) {
      const goldResult = await this.economyService.debitPlayer(playerId, CurrencyType.GOLD, priceGold);
      if (!goldResult.success) {
        return {
          success: false,
          error: `Cannot afford place: ${goldResult.error}`
        };
      }
    }

    // Try to deduct gems if required and gold was sufficient
    if (priceGems > 0) {
      const gemsResult = await this.economyService.debitPlayer(playerId, CurrencyType.GEMS, priceGems);
      if (!gemsResult.success) {
        // Rollback gold if gems deduction failed
        if (priceGold > 0) {
          await this.economyService.creditPlayer(playerId, CurrencyType.GOLD, priceGold);
        }
        return {
          success: false,
          error: `Cannot afford place: ${gemsResult.error}`
        };
      }
    }

    // 6. Create PlaceInstance
    try {
      const placeInstance = await this.createPlaceInstance(player, place);
      return {
        success: true,
        placeInstance
      };
    } catch (error) {
      // Rollback currency on failure
      if (priceGold > 0) {
        await this.economyService.creditPlayer(playerId, CurrencyType.GOLD, priceGold);
      }
      if (priceGems > 0) {
        await this.economyService.creditPlayer(playerId, CurrencyType.GEMS, priceGems);
      }
      throw error;
    }
  }

  /**
   * Create a PlaceInstance for the player.
   *
   * @param player - The player entity
   * @param place - The place template entity
   * @returns The created PlaceInstance
   */
  private async createPlaceInstance(player: any, place: Place): Promise<PlaceInstance> {
    const placeInstanceData = {
      place: place,
      gameId: player.gameId,
      playerId: player._id,
      jobOffers: [],
      content: {}
    } as any;

    return this.placeInstancesService.create(placeInstanceData);
  }
}
