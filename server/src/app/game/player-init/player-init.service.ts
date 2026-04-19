import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { PlayersService } from '../../api/support/players.module';
import { PlacesService } from '../../api/places.module';
import { PlaceInstancesService, PlaceInstance } from '../../api/place-instance.module';
import { VehicleInstancesService } from '../../api/vehicle-instances.module';
import { VehiclesService } from '../../api/vehicles.module';

/**
 * DTO for selecting a starting place.
 */
export class SelectStartingPlaceDto {
  placeId: string;
}

/**
 * Result of a starting place selection operation.
 */
export interface SelectStartingPlaceResult {
  success: boolean;
  placeInstance?: PlaceInstance;
  vehicleInstance?: any;
  error?: string;
}

/**
 * Service for initializing new players with their starting resources.
 *
 * Handles:
 * - Creating a PlaceInstance at the selected starting place
 * - Creating a starter VehicleInstance at that place
 * - Setting initial wallet (handled in Games.tsx - this service focuses on instances)
 *
 * The flow:
 * 1. Player joins game (wallet created with 10,000 gold + 100 gems)
 * 2. Player selects starting place from available places
 * 3. This service creates PlaceInstance and starter VehicleInstance
 */
@Injectable()
export class PlayerInitService {
  constructor(
    private readonly playersService: PlayersService,
    private readonly placesService: PlacesService,
    private readonly placeInstancesService: PlaceInstancesService,
    private readonly vehicleInstancesService: VehicleInstancesService,
    private readonly vehiclesService: VehiclesService
  ) {}

  /**
   * Select a starting place for a new player.
   *
   * Creates:
   * 1. A PlaceInstance at the selected place (player now owns it)
   * 2. A starter VehicleInstance at that place (level 1 locomotive)
   *
   * @param playerId - The player's ID
   * @param placeId - The place template ID to start at
   * @returns Result with created instances or error message
   * @throws NotFoundException if player or place not found
   */
  async selectStartingPlace(playerId: string, placeId: string): Promise<SelectStartingPlaceResult> {
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

    // 3. Check player doesn't already have a place instance
    const existingInstances = await this.placeInstancesService.findAll({
      page: 1,
      pageSize: 1000
    } as any);
    const playerAlreadyHasPlace = existingInstances.data.some(
      (pi: any) => pi.playerId?.toString() === playerId && pi.place?._id?.toString() === placeId
    );
    if (playerAlreadyHasPlace) {
      return {
        success: false,
        error: 'Player already has a place at this location'
      };
    }

    // 4. Create PlaceInstance at the starting place
    const placeInstance = await this.placeInstancesService.create({
      place: place,
      gameId: new ObjectId(player.gameId),
      playerId: new ObjectId(playerId),
      jobOffers: [],
      content: {}
    } as any);

    // 5. Find a starter vehicle template (first/cheapest locomotive)
    // Vehicles are templates from the game template, so try to find any available
    let vehiclesResult = await this.vehiclesService.findAllWhere(
      { gameId: player.gameId },
      { page: 1, pageSize: 100 } as any
    );
    let vehiclesData = vehiclesResult.data;

    if (vehiclesData.length === 0) {
      // Try without gameId filter - vehicles might be template-level
      const allVehicles = await this.vehiclesService.findAll({ page: 1, pageSize: 100 } as any);
      vehiclesData = allVehicles.data;
    }

    const starterVehicle = vehiclesData.find((v: any) => v.type === 'LOCOMOTIVE');
    if (!starterVehicle) {
      // Fallback: use first available vehicle sorted by price
      const sortedByPrice = [...vehiclesData].sort((a: any, b: any) => {
        return (a.priceGold || 0) - (b.priceGold || 0);
      });
      if (sortedByPrice.length === 0) {
        return {
          success: false,
          error: 'No vehicle templates available in the system'
        };
      }
    }
    const vehicleTemplate = starterVehicle || vehiclesData[0];

    // 6. Create VehicleInstance for the player at the starting place
    const vehicleInstance = await this.vehicleInstancesService.create({
      vehicleId: vehicleTemplate._id,
      currentPlaceInstance: placeInstance,
      destinationPlaceInstance: null,
      route: [],
      status: 'AT_PLACE',
      gameId: player.gameId,
      playerId: new ObjectId(playerId),
      content: {}
    } as any);

    return {
      success: true,
      placeInstance,
      vehicleInstance
    };
  }
}
