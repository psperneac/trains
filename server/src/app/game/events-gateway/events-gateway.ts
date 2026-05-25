import { Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { PlaceInstancesService } from '../../api/place-instance.module';
import { VehicleInstancesService } from '../../api/vehicle-instances.module';
import { AuthenticationService } from '../../../authentication/authentication.service';
import { JobOffer } from 'src/app/api/jobs.module';

interface SubscribePayload {
  gameId: string;
  playerId: string;
}

interface FullSyncPayload {
  gameId: string;
  playerId: string;
}

interface JobOffersUpdatedPayload {
  placeId: string;
  jobOffers: any[];
}

interface VehicleStateUpdatedPayload {
  vehicle: any;
}

@Injectable()
@WebSocketGateway({ cors: { origin: '*' }, namespace: '/game' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly authService: AuthenticationService,
    private readonly placeInstancesService: PlaceInstancesService,
    private readonly vehicleInstancesService: VehicleInstancesService
  ) {}

  async handleConnection(client: Socket, ...args: any[]): Promise<void> {
    const token = client.handshake.auth.token as string;

    if (!token) {
      this.logger.warn(`Client ${client.id} connected without token`);
      client.emit('error', { message: 'Authentication required' });
      client.disconnect();
      return;
    }

    try {
      const isValid = await this.authService.validateToken(token);
      if (!isValid) {
        this.logger.warn(`Client ${client.id} provided invalid token`);
        client.emit('error', { message: 'Invalid token' });
        client.disconnect();
        return;
      }

      this.logger.log(`Client ${client.id} connected successfully`);
    } catch (error) {
      this.logger.error(`Token validation error for client ${client.id}:`, error);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('game:join')
  handleSubscribe(client: Socket, payload: SubscribePayload): void {
    const { playerId } = payload;

    if (playerId) {
      client.join(`player:${playerId}`);
      this.logger.log(`Client ${client.id} joined player:${playerId}`);
    }
  }

  @SubscribeMessage('game:leave')
  handleUnsubscribe(client: Socket, payload: SubscribePayload): void {
    const { playerId } = payload;

    if (playerId) {
      client.leave(`player:${playerId}`);
      this.logger.log(`Client ${client.id} left player:${playerId}`);
    }
  }

  @SubscribeMessage('game:requestFullSync')
  async handleRequestFullSync(client: Socket, payload: FullSyncPayload): Promise<void> {
    const { gameId, playerId } = payload;

    try {
      // Fetch all place instances for the game
      const placeInstancesResult = await this.placeInstancesService.findAll({
        page: 1,
        pageSize: 1000
      } as any);

      const gamePlaceInstances = placeInstancesResult.data.filter(
        (pi) => pi.gameId?.toString() === gameId
      );

      // Fetch all vehicle instances for the player
      const vehicleInstancesResult = await this.vehicleInstancesService.findAllByPlayer(
        { page: 1, pageSize: 1000 } as any,
        playerId
      );

      const syncData = {
        placeInstances: gamePlaceInstances,
        vehicleInstances: vehicleInstancesResult.data
      };

      // Emit only to the requesting client
      client.emit('fullSync', syncData);
      this.logger.log(`Sent fullSync to client ${client.id} for game ${gameId}, player ${playerId}`);
    } catch (error) {
      this.logger.error(`Error in handleRequestFullSync for client ${client.id}:`, error);
      client.emit('error', { message: 'Failed to retrieve sync data' });
    }
  }

  /**
   * Broadcast job offers update to the player.
   * @param playerId - The player ID
   * @param placeId - The place instance ID
   * @param jobOffers - Updated job offers
   */
  broadcastJobOffersUpdated(playerId: string, placeId: string, jobOffers: JobOffer[]): void {
    const payload: JobOffersUpdatedPayload = { placeId, jobOffers };
    this.server.to(`player:${playerId}`).emit('jobOffersUpdated', payload);
    this.logger.debug(`Broadcast jobOffersUpdated for place ${placeId} to player ${playerId}`, jobOffers);
  }

  /**
   * Broadcast vehicle state update to all clients subscribed to the player's room.
   * @param playerId - The player ID
   * @param vehicle - Updated vehicle data
   */
  broadcastVehicleStateUpdated(playerId: string, vehicle: any): void {
    const payload: VehicleStateUpdatedPayload = { vehicle };
    this.server.to(`player:${playerId}`).emit('vehicleStateUpdated', payload);
    this.logger.debug(`Broadcast vehicleStateUpdated for player ${playerId}`);
  }
}