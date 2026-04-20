import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { PlaceInstancesService } from '../../api/place-instance.module';
import { PlaceConnectionService } from '../../api/place-connection.module';
import { PlacesService } from '../../api/places.module';
import { PlaceInstance } from '../../api/place-instance.module';
import { Place } from '../../api/places.module';

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

    const ownedPlaces: Place[] = [];
    // connections are by place not placeInstance. we get the placeId then get connections
    for (const pi of ownedPlaceInstances) {
      if (pi.placeId) {
        const place = await this.placesService.findOne(pi.placeId);
        if (place) {
          ownedPlaces.push(place);
        }
      }
    }

    const availablePlaces = await this.getAvailablePlaces(playerId);

    return {
      owned: ownedPlaces,
      available: availablePlaces
    };
  }

  /**
   * Get all PlaceInstances owned by a player.
   *
   * @param playerId - The player's ID
   * @returns Array of PlaceInstance entities owned by the player
   */
  async getOwnedPlaceInstances(playerId: string): Promise<PlaceInstance[]> {
    const allPlaceInstances = await this.placeInstancesService.findAll({ page: 1, pageSize: 1000 } as any);
    console.log('[MapReveal] allPlaceInstances:', allPlaceInstances.data.length, allPlaceInstances.data.map(pi => ({
      id: pi._id?.toString(),
      playerId: pi.playerId?.toString(),
      placeId: pi.placeId?.toString()
    })));
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

    // Keep as ObjectIds to avoid string conversion
    const ownedTemplateIds = ownedPlaceInstances
      .map(pi => pi.placeId)
      .filter(id => id instanceof ObjectId);

    if (ownedTemplateIds.length === 0) {
      return [];
    }

    // Get available place IDs (connected but not owned) in one query
    const availableTemplateIds = await this.findAvailablePlaceIds(ownedTemplateIds);

    console.log('[MapReveal] availableTemplateIds:', availableTemplateIds);

    if (availableTemplateIds.length === 0) {
      return [];
    }

    // Fetch all available places - use findAll and filter in memory since $or with $in doesn't work in TypeORM
    const availableIdStrings = availableTemplateIds.map(id => id.toString());
    console.log('[MapReveal] about to query places with id strings:', availableIdStrings);

    // Use findAll and filter in memory
    const allPlacesResult = await this.placesService.findAll({ page: 1, pageSize: 10000 } as any);
    const availablePlaces = allPlacesResult.data.filter(place =>
      availableIdStrings.includes(place._id?.toString())
    );
    console.log('[MapReveal] availablePlaces:', availablePlaces.length, availablePlaces.map(p => p._id?.toString()));
    return availablePlaces;
  }

  /**
   * Find all available place ObjectIds (connected but not owned).
   *
   * @param ownedPlaceIds - Array of owned place template ObjectIds
   * @returns Array of available place ObjectIds
   */
  private async findAvailablePlaceIds(ownedPlaceIds: ObjectId[]): Promise<ObjectId[]> {
    if (ownedPlaceIds.length === 0) {
      return [];
    }

    console.log('[MapReveal] findAvailablePlaceIds called with:', ownedPlaceIds.map(id => id.toString()));

    // TypeORM doesn't support $or with $in in FindOptionsWhere, so query each owned ID separately
    const allConnections: any[] = [];

    for (const ownedId of ownedPlaceIds) {
      // Query for connections where this place is startId
      const startConnections = await this.placeConnectionsService.findAllWhere(
        { startId: ownedId } as any,
        { page: 1, pageSize: 1000 } as any
      );
      // Query for connections where this place is endId
      const endConnections = await this.placeConnectionsService.findAllWhere(
        { endId: ownedId } as any,
        { page: 1, pageSize: 1000 } as any
      );

      allConnections.push(...startConnections.data, ...endConnections.data);
    }

    console.log('[MapReveal] connections found:', allConnections.length, allConnections.map(c => ({
      startId: c.startId?.toString(),
      endId: c.endId?.toString()
    })));

    // Convert owned IDs to strings for Set comparison
    const ownedIdStrings = new Set(ownedPlaceIds.map(id => id.toString()));
    const availableIds = new Set<string>();

    for (const conn of allConnections) {
      // Skip self-loops (startId === endId) - they don't provide new available places
      const startIdStr = conn.startId?.toString();
      const endIdStr = conn.endId?.toString();
      if (startIdStr === endIdStr) continue;

      if (startIdStr && !ownedIdStrings.has(startIdStr)) {
        availableIds.add(startIdStr);
      }
      if (endIdStr && !ownedIdStrings.has(endIdStr)) {
        availableIds.add(endIdStr);
      }
    }

    console.log('[MapReveal] availableIds:', [...availableIds]);
    return [...availableIds].map(id => new ObjectId(id));
  }
}
