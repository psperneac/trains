import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PlayerController, PlayerFullStateDto } from './players.module';
import { PlayersService } from './players.module';
import { PlayerMapper } from './players.module';
import { TransactionsService } from './transactions.module';
import { PlaceInstancesService } from '../place-instance.module';
import { PlaceInstanceMapper } from '../place-instance.module';
import { VehicleInstancesService } from '../vehicle-instances.module';
import { VehicleInstanceMapper } from '../vehicle-instances.module';
import { PageDto } from '../../../models/page.model';

describe('PlayerController', () => {
  let controller: PlayerController;
  let playersService: jest.Mocked<PlayersService>;
  let playersMapper: jest.Mocked<PlayerMapper>;
  let placeInstancesService: jest.Mocked<PlaceInstancesService>;
  let placeInstanceMapper: jest.Mocked<PlaceInstanceMapper>;
  let vehicleInstancesService: jest.Mocked<VehicleInstancesService>;
  let vehicleInstanceMapper: jest.Mocked<VehicleInstanceMapper>;

  const mockPlayerId = '507f1f77bcf86cd799439011';
  const mockUserId = '507f1f77bcf86cd799439001';
  const mockGameId = '507f1f77bcf86cd799439002';

  beforeEach(async () => {
    const mockPlayersServiceMethods = {
      findOne: jest.fn(),
    };

    const mockPlayersMapperMethods = {
      toDto: jest.fn(),
    };

    const mockPlaceInstancesServiceMethods = {
      findAllByPlayer: jest.fn(),
    };

    const mockPlaceInstanceMapperMethods = {
      toDto: jest.fn(),
    };

    const mockVehicleInstancesServiceMethods = {
      findAllByPlayer: jest.fn(),
    };

    const mockVehicleInstanceMapperMethods = {
      toDto: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerController],
      providers: [
        { provide: PlayersService, useValue: mockPlayersServiceMethods },
        { provide: PlayerMapper, useValue: mockPlayersMapperMethods },
        { provide: TransactionsService, useValue: {} },
        { provide: PlaceInstancesService, useValue: mockPlaceInstancesServiceMethods },
        { provide: PlaceInstanceMapper, useValue: mockPlaceInstanceMapperMethods },
        { provide: VehicleInstancesService, useValue: mockVehicleInstancesServiceMethods },
        { provide: VehicleInstanceMapper, useValue: mockVehicleInstanceMapperMethods },
      ],
    }).compile();

    controller = module.get<PlayerController>(PlayerController);
    playersService = module.get(PlayersService);
    playersMapper = module.get(PlayerMapper);
    placeInstancesService = module.get(PlaceInstancesService);
    placeInstanceMapper = module.get(PlaceInstanceMapper);
    vehicleInstancesService = module.get(VehicleInstancesService);
    vehicleInstanceMapper = module.get(VehicleInstanceMapper);
  });

  describe('getFullState', () => {
    it('should return full state with player, place instances, and vehicle instances', async () => {
      const mockPlayer = {
        _id: { toString: () => mockPlayerId } as any,
        name: 'Test Player',
        description: 'Test player description',
        userId: { toString: () => mockUserId } as any,
        gameId: { toString: () => mockGameId } as any,
        wallet: { gold: 10000, gems: 100, parts: 0, content: {} },
        content: {},
        created: new Date(),
        updated: new Date(),
        deleted: null as any,
      };

      const mockPlaceInstance = {
        _id: { toString: () => '507f1f77bcf86cd799439003' } as any,
        place: {
          _id: { toString: () => '507f1f77bcf86cd799439004' } as any,
          name: 'Test Place',
          description: 'A test place',
          type: 'station',
          lat: 40.7128,
          lng: -74.006,
        },
        gameId: { toString: () => mockGameId } as any,
        playerId: { toString: () => mockPlayerId } as any,
        jobOffers: [],
        content: {},
        created: new Date(),
        updated: new Date(),
        deleted: null as any,
      };

      const mockVehicleInstance = {
        _id: { toString: () => '507f1f77bcf86cd799439005' } as any,
        vehicleId: { toString: () => '507f1f77bcf86cd799439006' } as any,
        currentPlaceInstance: mockPlaceInstance,
        destinationPlaceInstance: null,
        route: [],
        status: 'AT_PLACE',
        gameId: { toString: () => mockGameId } as any,
        playerId: { toString: () => mockPlayerId } as any,
        content: {},
        created: new Date(),
        updated: new Date(),
        deleted: null as any,
      };

      const mockPlayerDto = {
        id: mockPlayerId,
        name: mockPlayer.name,
        description: mockPlayer.description,
        userId: mockUserId,
        gameId: mockGameId,
        wallet: { id: 'wallet-1', gold: 10000, gems: 100, parts: 0, content: {} },
        content: mockPlayer.content,
      };

      const mockPlaceInstanceDto = {
        id: mockPlaceInstance._id.toString(),
        placeId: mockPlaceInstance.place._id.toString(),
        gameId: mockGameId,
        playerId: mockPlayerId,
        place: mockPlaceInstance.place,
        jobOffers: [],
        content: {},
      };

      const mockVehicleInstanceDto = {
        id: mockVehicleInstance._id.toString(),
        vehicleId: mockVehicleInstance.vehicleId.toString(),
        currentPlaceInstanceId: mockPlaceInstance._id.toString(),
        destinationPlaceInstanceId: undefined,
        vehicle: {},
        currentPlaceInstance: mockPlaceInstance,
        destinationPlaceInstance: undefined,
        route: [],
        status: 'AT_PLACE' as const,
        gameId: mockGameId,
        playerId: mockPlayerId,
        content: {},
      };

      playersService.findOne.mockResolvedValue(mockPlayer as any);
      playersMapper.toDto.mockResolvedValue(mockPlayerDto as any);

      const placeInstancesPage: PageDto<any> = {
        data: [mockPlaceInstance],
        page: 1,
        limit: 10,
        totalCount: 1,
      };
      placeInstancesService.findAllByPlayer.mockResolvedValue(placeInstancesPage);
      placeInstanceMapper.toDto.mockResolvedValue(mockPlaceInstanceDto);

      const vehicleInstancesPage: PageDto<any> = {
        data: [mockVehicleInstance],
        page: 1,
        limit: 10,
        totalCount: 1,
      };
      vehicleInstancesService.findAllByPlayer.mockResolvedValue(vehicleInstancesPage);
      vehicleInstanceMapper.toDto.mockResolvedValue(mockVehicleInstanceDto);

      const result = await controller.getFullState(mockPlayerId);

      expect(result).toHaveProperty('player');
      expect(result).toHaveProperty('placeInstances');
      expect(result).toHaveProperty('vehicleInstances');
      expect(result.player.id).toBe(mockPlayerId);
      expect(result.placeInstances).toHaveLength(1);
      expect(result.vehicleInstances).toHaveLength(1);
      expect(playersService.findOne).toHaveBeenCalledWith(mockPlayerId);
      expect(placeInstancesService.findAllByPlayer).toHaveBeenCalledWith({}, mockPlayerId);
      expect(vehicleInstancesService.findAllByPlayer).toHaveBeenCalledWith({}, mockPlayerId);
    });

    it('should return 404 when player not found', async () => {
      playersService.findOne.mockResolvedValue(null);

      await expect(controller.getFullState(mockPlayerId)).rejects.toThrow('Player not found');
    });

    it('should return empty arrays when player has no place or vehicle instances', async () => {
      const mockPlayer = {
        _id: { toString: () => mockPlayerId } as any,
        name: 'Test Player',
        description: 'Test player description',
        userId: { toString: () => mockUserId } as any,
        gameId: { toString: () => mockGameId } as any,
        wallet: { gold: 10000, gems: 100, parts: 0, content: {} },
        content: {},
        created: new Date(),
        updated: new Date(),
        deleted: null as any,
      };

      const mockPlayerDto = {
        id: mockPlayerId,
        name: mockPlayer.name,
        description: mockPlayer.description,
        userId: mockUserId,
        gameId: mockGameId,
        wallet: { id: 'wallet-1', gold: 10000, gems: 100, parts: 0, content: {} },
        content: mockPlayer.content,
      };

      playersService.findOne.mockResolvedValue(mockPlayer as any);
      playersMapper.toDto.mockResolvedValue(mockPlayerDto as any);

      const emptyPlaceInstancesPage: PageDto<any> = {
        data: [],
        page: 1,
        limit: 10,
        totalCount: 0,
      };
      placeInstancesService.findAllByPlayer.mockResolvedValue(emptyPlaceInstancesPage);

      const emptyVehicleInstancesPage: PageDto<any> = {
        data: [],
        page: 1,
        limit: 10,
        totalCount: 0,
      };
      vehicleInstancesService.findAllByPlayer.mockResolvedValue(emptyVehicleInstancesPage);

      const result = await controller.getFullState(mockPlayerId);

      expect(result.player.id).toBe(mockPlayerId);
      expect(result.placeInstances).toHaveLength(0);
      expect(result.vehicleInstances).toHaveLength(0);
    });
  });
});
