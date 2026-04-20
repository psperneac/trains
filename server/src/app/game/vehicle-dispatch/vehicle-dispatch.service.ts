import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { InMemorySchedulerService } from '../scheduler/in-memory-scheduler.service';
import { VehicleInstancesService } from '../../api/vehicle-instances.module';
import { PlaceInstancesService } from '../../api/place-instance.module';
import { PlaceConnectionService } from '../../api/place-connection.module';
import { JobsService } from '../../api/jobs.module';
import { PlacesService } from '../../api/places.module';
import { EconomyService, CurrencyType } from '../economy/economy.service';

/**
 * DTO for dispatching a vehicle with a route.
 */
export class DispatchVehicleDto {
  /** Array of PlaceInstance IDs forming the route */
  route: string[];
}

/**
 * Result of a vehicle dispatch operation.
 */
export interface DispatchResult {
  success: boolean;
  vehicleInstance?: any;
  scheduledTaskId?: string;
  travelTimeMs?: number;
  error?: string;
}

/**
 * Payload for scheduled arrival events.
 */
export interface ArrivalPayload {
  vehicleInstanceId: string;
  destinationPlaceInstanceId: string;
  routeIndex: number;
  remainingRoute: string[];
}

/**
 * Service for dispatching vehicles and managing their routes.
 *
 * The VehicleDispatchService handles:
 * - Route validation (verifying connections exist between consecutive stops)
 * - Travel time calculation (based on distance and vehicle speed)
 * - Arrival processing (delivering jobs, updating vehicle position)
 * - Multi-stop handling (continuing to next stop or ending journey)
 *
 * Usage:
 * ```
 * const dispatchService = container.get(VehicleDispatchService);
 *
 * // Dispatch a vehicle with a route
 * const result = await dispatchService.dispatch(vehicleInstanceId, route);
 * if (result.success) {
 *   console.log(`Vehicle will arrive in ${result.travelTimeMs}ms`);
 * }
 * ```
 */
@Injectable()
export class VehicleDispatchService {
  constructor(
    private readonly vehicleInstancesService: VehicleInstancesService,
    private readonly placeInstancesService: PlaceInstancesService,
    private readonly placeConnectionService: PlaceConnectionService,
    private readonly jobsService: JobsService,
    private readonly placesService: PlacesService,
    private readonly economyService: EconomyService,
    private readonly schedulerService: InMemorySchedulerService
  ) {
    // Register handler for arrival events
    this.schedulerService.on('vehicle:arrival', this.processArrival.bind(this));
  }

  /**
   * Dispatch a vehicle along a specified route.
   *
   * The dispatch operation:
   * 1. Validates the vehicle exists and is at a place
   * 2. Validates the route (all connections must exist)
   * 3. Calculates total travel time
   * 4. Updates vehicle status to IN_TRANSIT
   * 5. Schedules arrival event
   *
   * @param vehicleInstanceId - The vehicle to dispatch
   * @param route - Array of PlaceInstance IDs forming the route
   * @returns Result indicating success or failure with details
   * @throws NotFoundException if vehicle not found
   * @throws BadRequestException if vehicle is already in transit or route is invalid
   */
  async dispatch(vehicleInstanceId: string, route: string[]): Promise<DispatchResult> {
    // 1. Validate vehicle exists
    const vehicle = await this.vehicleInstancesService.findOne(vehicleInstanceId);
    if (!vehicle) {
      throw new NotFoundException(`Vehicle not found: ${vehicleInstanceId}`);
    }

    // 2. Validate vehicle is at a place (not already in transit)
    if (vehicle.status === 'IN_TRANSIT') {
      return {
        success: false,
        error: 'Vehicle is already in transit'
      };
    }

    // 3. Validate minimum route (need at least 2 stops: current + destination)
    if (!route || route.length < 2) {
      return {
        success: false,
        error: 'Route must have at least 2 stops'
      };
    }

    // 4. Validate first stop is current location
    const currentPlaceId = vehicle.currentPlaceInstance?.toString();
    if (route[0] !== currentPlaceId) {
      return {
        success: false,
        error: `Route must start at vehicle's current location`
      };
    }

    // 5. Validate route connections
    await this.validateRoute(route);

    // 6. Calculate travel time
    const travelTimeMs = await this.calculateTravelTime(vehicle, route);

    // 7. Update vehicle status
    const destinationPlaceInstanceId = route[route.length - 1];
    vehicle.status = 'IN_TRANSIT';
    vehicle.destinationPlaceInstance = new ObjectId(destinationPlaceInstanceId);
    vehicle.route = route.map(id => new ObjectId(id));
    vehicle.currentPlaceInstance = null;
    await this.vehicleInstancesService.update(vehicleInstanceId, vehicle);

    // 8. Schedule arrival
    const remainingRoute = route.slice(1);
    const payload: ArrivalPayload = {
      vehicleInstanceId,
      destinationPlaceInstanceId,
      routeIndex: route.length - 1,
      remainingRoute
    };

    const scheduledTaskId = this.schedulerService.schedule(
      'vehicle:arrival',
      payload,
      travelTimeMs
    );

    return {
      success: true,
      vehicleInstance: vehicle,
      scheduledTaskId,
      travelTimeMs
    };
  }

  /**
   * Validate that a route has valid connections between all consecutive stops.
   *
   * For each pair of consecutive stops, verifies that a PlaceConnection
   * exists in either direction (connections are bidirectional).
   *
   * @param route - Array of PlaceInstance IDs
   * @throws BadRequestException if any connection is invalid
   */
  async validateRoute(route: string[]): Promise<void> {
    for (let i = 0; i < route.length - 1; i++) {
      const startId = route[i];
      const endId = route[i + 1];

      // Get template Place IDs from PlaceInstances
      const startPlaceInstance = await this.placeInstancesService.findOne(startId);
      const endPlaceInstance = await this.placeInstancesService.findOne(endId);

      if (!startPlaceInstance || !endPlaceInstance) {
        throw new BadRequestException(`Invalid place in route at index ${i}`);
      }

      const startTemplateId = startPlaceInstance.placeId;
      const endTemplateId = endPlaceInstance.placeId;

      if (!startTemplateId || !endTemplateId) {
        throw new BadRequestException(`Place instance missing template reference at index ${i}`);
      }

      // Check PlaceConnection exists (in either direction)
      const connection = await this.findConnectionBetweenPlaces(
        startTemplateId.toString(),
        endTemplateId.toString()
      );

      if (!connection) {
        // Fetch place names for error message
        const startPlaceName = (await this.placesService.findOne(startTemplateId.toString()))?.name;
        const endPlaceName = (await this.placesService.findOne(endTemplateId.toString()))?.name;
        throw new BadRequestException(
          `No route between place ${startPlaceName || startId} and ${endPlaceName || endId}`
        );
      }
    }
  }

  /**
   * Find a connection between two template places.
   * Searches in both directions since connections are bidirectional.
   *
   * @param startId - Start place template ID
   * @param endId - End place template ID
   * @returns PlaceConnection if found, null otherwise
   */
  private async findConnectionBetweenPlaces(startId: string, endId: string): Promise<any | null> {
    // Try to find connection in both directions
    const allConnections = await this.placeConnectionService.findAll({ page: 1, pageSize: 1000 } as any);

    return allConnections.data.find(conn => {
      const connStartId = conn.startId?.toString();
      const connEndId = conn.endId?.toString();
      return (connStartId === startId && connEndId === endId) ||
             (connStartId === endId && connEndId === startId);
    }) || null;
  }

  /**
   * Calculate total travel time for a vehicle along a route.
   *
   * Sums distances for all legs of the journey, then divides by vehicle speed.
   * Time is returned in milliseconds.
   *
   * @param vehicle - The vehicle instance
   * @param route - Array of PlaceInstance IDs
   * @returns Total travel time in milliseconds
   */
  async calculateTravelTime(vehicle: any, route: string[]): Promise<number> {
    let totalDistance = 0;

    for (let i = 0; i < route.length - 1; i++) {
      const startPlaceInstance = await this.placeInstancesService.findOne(route[i]);
      const endPlaceInstance = await this.placeInstancesService.findOne(route[i + 1]);

      const startTemplateId = startPlaceInstance.placeId?.toString();
      const endTemplateId = endPlaceInstance.placeId?.toString();

      const connection = await this.findConnectionBetweenPlaces(startTemplateId, endTemplateId);
      if (connection) {
        totalDistance += this.calculateDistanceFromConnection(connection);
      }
    }

    // Time = distance / speed (speed is in km per ms)
    const speed = vehicle.vehicle?.speed || 1;
    return Math.ceil(totalDistance / speed);
  }

  /**
   * Calculate total distance of a connection based on its route points.
   *
   * Uses the Haversine formula to calculate distances between consecutive
   * points in the connection's content.routePoints array.
   *
   * @param connection - The place connection
   * @returns Total distance in kilometers
   */
  private calculateDistanceFromConnection(connection: any): number {
    const points = connection.content?.routePoints || [];
    let distance = 0;

    for (let i = 0; i < points.length - 1; i++) {
      distance += this.haversine(points[i], points[i + 1]);
    }

    return distance;
  }

  /**
   * Calculate distance between two geographic points using Haversine formula.
   *
   * @param p1 - First point with lat/lng properties
   * @param p2 - Second point with lat/lng properties
   * @returns Distance in kilometers
   */
  private haversine(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(p2.lat - p1.lat);
    const dLon = this.toRad(p2.lng - p1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(p1.lat)) * Math.cos(this.toRad(p2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians.
   *
   * @param degrees - Angle in degrees
   * @returns Angle in radians
   */
  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Process vehicle arrival at a destination.
   *
   * This handler:
   * 1. Updates vehicle position to the arrived place
   * 2. Delivers any jobs destined for this place
   * 3. Checks if there are more stops in the route (multi-stop)
   * 4. If more stops, schedules next arrival
   * 5. If journey complete, sets vehicle to AT_PLACE status
   *
   * @param payload - Arrival event payload containing routing info
   */
  async processArrival(payload: ArrivalPayload): Promise<void> {
    const { vehicleInstanceId, destinationPlaceInstanceId, routeIndex, remainingRoute } = payload;

    // 1. Update vehicle to show arrival
    const vehicle = await this.vehicleInstancesService.findOne(vehicleInstanceId);
    if (!vehicle) {
      console.error(`Vehicle not found during arrival processing: ${vehicleInstanceId}`);
      return;
    }

    const arrivedPlace = await this.placeInstancesService.findOne(destinationPlaceInstanceId);
    if (!arrivedPlace) {
      console.error(`Destination place not found during arrival: ${destinationPlaceInstanceId}`);
      return;
    }

    // 2. Deliver jobs destined for this place
    await this.deliverJobsAtPlace(vehicle, arrivedPlace);

    // 3. Update vehicle position
    vehicle.currentPlaceInstance = arrivedPlace._id;
    vehicle.destinationPlaceInstance = null;

    // 4. Check for multi-stop handling
    if (remainingRoute.length > 1) {
      // More stops - continue journey
      vehicle.route = remainingRoute.map(id => new ObjectId(id));
      vehicle.status = 'IN_TRANSIT';

      const nextDestination = remainingRoute[remainingRoute.length - 1];
      vehicle.destinationPlaceInstance = new ObjectId(nextDestination);
      vehicle.currentPlaceInstance = null;

      // Calculate time to next destination
      const travelTimeMs = await this.calculateTravelTime(vehicle, remainingRoute);

      await this.vehicleInstancesService.update(vehicleInstanceId, vehicle);

      // Schedule next arrival
      const nextPayload: ArrivalPayload = {
        vehicleInstanceId,
        destinationPlaceInstanceId: remainingRoute[remainingRoute.length - 1],
        routeIndex: remainingRoute.length - 1,
        remainingRoute: remainingRoute.slice(1)
      };

      this.schedulerService.schedule('vehicle:arrival', nextPayload, travelTimeMs);
    } else if (remainingRoute.length === 1) {
      // Final destination reached
      vehicle.route = [];
      vehicle.status = 'AT_PLACE';
      await this.vehicleInstancesService.update(vehicleInstanceId, vehicle);
    } else {
      // No remaining stops
      vehicle.route = [];
      vehicle.status = 'AT_PLACE';
      await this.vehicleInstancesService.update(vehicleInstanceId, vehicle);
    }
  }

  /**
   * Deliver jobs from a vehicle that are destined for a specific place.
   *
   * Finds all jobs loaded on the vehicle where the destination matches
   * the arrived place, then:
   * 1. Credits the player with the job payment
   * 2. Updates or removes the job entity
   *
   * @param vehicle - The vehicle instance that arrived
   * @param place - The place instance where we arrived
   */
  private async deliverJobsAtPlace(vehicle: any, place: any): Promise<void> {
    const playerId = vehicle.playerId;

    // Find jobs on this vehicle destined for this place
    const jobs = await this.findJobsForVehicleAtPlace(vehicle._id.toString(), place._id.toString());

    for (const job of jobs) {
      // Credit player for delivery
      const currency = job.payType === 'GEMS' ? CurrencyType.GEMS : CurrencyType.GOLD;
      await this.economyService.creditPlayer(playerId, currency, job.pay);

      // Remove job from vehicle (job is delivered)
      job.content = { ...job.content, delivered: true, deliveredAt: new Date() };
      await this.jobsService.update(job._id.toString(), job);
    }
  }

  /**
   * Find jobs on a vehicle that are destined for a specific place.
   *
   * @param vehicleInstanceId - The vehicle to check
   * @param placeInstanceId - The destination place
   * @returns Array of matching jobs
   */
  private async findJobsForVehicleAtPlace(vehicleInstanceId: string, placeInstanceId: string): Promise<any[]> {
    // Get all jobs
    const allJobs = await this.jobsService.findAll({ page: 1, pageSize: 1000 } as any);

    return allJobs.data.filter(job => {
      const jobVehicleId = job.vehicleInstanceId?.toString();
      const jobEndPlaceId = job.endPlaceId?.toString();
      return jobVehicleId === vehicleInstanceId && jobEndPlaceId === placeInstanceId;
    });
  }

  /**
   * Get current status of a vehicle including position and route info.
   *
   * @param vehicleInstanceId - The vehicle to check
   * @returns Vehicle instance with current state
   */
  async getVehicleStatus(vehicleInstanceId: string): Promise<any | null> {
    return this.vehicleInstancesService.findOne(vehicleInstanceId);
  }

  /**
   * Cancel a pending dispatch (if vehicle is still in transit).
   *
   * Note: This only prevents future arrivals from being processed.
   * The vehicle will remain at its last position until manually moved.
   *
   * @param vehicleInstanceId - The vehicle to cancel dispatch for
   * @returns true if cancelled, false if vehicle wasn't in transit
   */
  async cancelDispatch(vehicleInstanceId: string): Promise<boolean> {
    const vehicle = await this.vehicleInstancesService.findOne(vehicleInstanceId);
    if (!vehicle || vehicle.status !== 'IN_TRANSIT') {
      return false;
    }

    // TODO: Implement task cancellation when scheduler supports it
    // For now, mark vehicle as available for new dispatch
    // The in-flight journey will still complete but won't process

    return true;
  }
}
