import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { PlaceInstancesService } from '../../api/place-instance.module';
import { PlaceConnectionService } from '../../api/place-connection.module';
import { PlacesService } from '../../api/places.module';
import { PlaceInstance, PlaceInstanceDto } from '../../api/place-instance.module';
import { PlaceConnection } from '../../api/place-connection.module';
import { Place, PlaceDto } from '../../api/places.module';

/**
 * Result of map reveal operation containing owned and available places.
 */
export interface MapView {
  owned: Place[];
  available: Place[];
}

/**
 * Service for determining map visibility based on player-owned places.

 * The MapRevealService implements the map visibility algorithm that determines:
 * - Which places a player owns (PlaceInstances) - shown in full color
 * Which places are available for purchase (connected to owned places by 1 hop) - shown grayed out
 *
 * Algorithm (V1 Implementation Plan lines 432-465):
 * 1. Get all player's PlaceInstances
 * 2. Find all connected template places (1 hop) via PlaceConnection
 * 3. Separate owned vs available (available = connected but not owned)
 *
 * Usage:
 * ```
 * const mapReveal = container.get(MapRevealService);
 *
 * // Get player's owned place instances
 * const owned = await mapReveal.getOwnedPlaceInstances(playerId);
 *
 * // Get places available for purchase (1 hop from owned)
 * const available = await mapReveal.getAvailablePlaces(playerId);
 *
 * // Get full map view
 * const view = await mapReveal.getMapView(playerId);
 * ```
 */
@Injectable()
export class MapRevealService {
  constructor(
    private readonly placeInstancesService: PlaceInstancesService,
    private readonly placeConnectionsService: PlaceConnectionService,
    private readonly placesService: PlacesService
  ) {}

  /**
   * Get all PlaceInstances owned by a player.
   *
   * @param playerId - The player's ID
   * @returns Array of PlaceInstance entities owned by the player
   */
  async getOwnedPlaceInstances(playerId: string): Promise<PlaceInstance[]> {
    const allPlaceInstances = await this.placeInstancesService.findAll({ page: 1, pageSize: 1000 } as any);
    return allPlaceInstances.data.filter(pi => pi.playerId?.toString() === playerId);
  }

  /**
   * Get places available for purchase by the player.
   *
   * A place is available if:
   * 1. It's directly connected (1 hop) via PlaceConnection to ANY owned PlaceInstance
   * 2. It's not already owned by the player
   *
   * @param playerId - The player's ID
   * @returns Array of Place entities that can be purchased
   */
  async getAvailablePlaces(playerId: string): Promise<Place[]> {
    const ownedPlaceInstances = await this.getOwnedPlaceInstances(playerId);

    if (ownedPlaceInstances.length === 0) {
      return [];
    }

    const ownedTemplateIds = ownedPlaceInstances
      .map(pi => pi.place?._id?.toString())
      .filter(id => id);

    if (ownedTemplateIds.length === 0) {
      return [];
    }

    const connectedTemplateIds = await this.findConnectedPlaceIds(ownedTemplateIds);

    const availableTemplateIds = [...connectedTemplateIds]
      .filter(id => !ownedTemplateIds.includes(id));

    if (availableTemplateIds.length === 0) {
      return [];
    }

    const availablePlaces: Place[] = [];
    for (const templateId of availableTemplateIds) {
      const place = await this.placesService.findOne(templateId);
      if (place) {
        availablePlaces.push(place);
      }
    }

    return availablePlaces;
  }

  /**
   * Get the full map view for a player.
   *
   * Returns both owned places (full color, interactive) and available places
   * (grayed out, can purchase but no jobs).
   *
   * @param playerId - The player's ID
   * @returns MapView containing owned and available places
   */
  async getMapView(playerId: string): Promise<MapView> {
    const ownedPlaceInstances = await this.getOwnedPlaceInstances(playerId);

    const ownedPlaces = ownedPlaceInstances
      .map(pi => pi.place)
      .filter(place => place != null);

    const availablePlaces = await this.getAvailablePlaces(playerId);

    return {
      owned: ownedPlaces,
      available: availablePlaces
    };
  }

  /**
   * Find all place IDs that are connected (1 hop) to any of the owned places.
   *
   * @param ownedPlaceIds - Array of owned place template IDs
   * @returns Set of all connected place IDs (including the owned ones)
   */
  private async findConnectedPlaceIds(ownedPlaceIds: string[]): Promise<Set<string>> {
    const connectedTemplateIds = new Set<string>();

    for (const ownedId of ownedPlaceIds) {
      const connections = await this.placeConnectionsService.findAllWhere({
        $or: [
          { startId: new ObjectId(ownedId) },
          { endId: new ObjectId(ownedId) }
        ]
      } as any);

      for (const conn of connections.data) {
        connectedTemplateIds.add(conn.startId?.toString());
        connectedTemplateIds.add(conn.endId?.toString());
      }
    }

    return connectedTemplateIds;
  }
}
