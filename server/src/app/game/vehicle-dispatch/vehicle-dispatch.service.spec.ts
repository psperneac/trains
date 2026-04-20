import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VehicleDispatchService, DispatchVehicleDto, ArrivalPayload } from './vehicle-dispatch.service';
import { VehicleInstancesService } from '../../api/vehicle-instances.module';
import { PlaceInstancesService } from '../../api/place-instance.module';
import { PlaceConnectionService } from '../../api/place-connection.module';
import { JobsService } from '../../api/jobs.module';
import { PlacesService } from '../../api/places.module';
import { EconomyService, CurrencyType } from '../economy/economy.service';
import { InMemorySchedulerService } from '../scheduler/in-memory-scheduler.service';

// Mock implementations - must be declared before jest.mock
const mockVehicleInstancesService = {
  findOne: jest.fn(),
  update: jest.fn(),
  create: jest.fn()
};

const mockPlaceInstancesService = {
  findOne: jest.fn(),
  findAll: jest.fn()
};

const mockPlaceConnectionService = {
  findOne: jest.fn(),
  findAll: jest.fn()
};

const mockJobsService = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  create: jest.fn()
};

const mockPlacesService = {
  findOne: jest.fn()
};

const mockEconomyService = {
  creditPlayer: jest.fn(),
  debitPlayer: jest.fn()
};

const mockSchedulerService = {
  schedule: jest.fn().mockReturnValue('task-123'),
  cancel: jest.fn(),
  on: jest.fn(),
  getPending: jest.fn().mockReturnValue([])
};

// Mock the modules BEFORE importing the service
jest.mock('../../api/vehicle-instances.module');
jest.mock('../../api/place-instance.module');
jest.mock('../../api/place-connection.module');
jest.mock('../../api/jobs.module');
jest.mock('../../api/places.module');
jest.mock('../economy/economy.service');
jest.mock('../scheduler/in-memory-scheduler.service');

describe('VehicleDispatchService', () => {
  let service: VehicleDispatchService;

  const playerId = '507f1f77bcf86cd799439011';
  const place1Id = '507f1f77bcf86cd799439012';
  const place2Id = '507f1f77bcf86cd799439013';
  const place3Id = '507f1f77bcf86cd799439014';
  const vehicleId = '507f1f77bcf86cd799439015';
  const gameId = '507f1f77bcf86cd799439016';

  const createMockPlace = (id: string, name: string) => ({
    _id: { toString: () => id } as any,
    name,
    description: `Description for ${name}`,
  });

  const createMockPlaceInstance = (id: string, playerId: string, placeId: string, placeName: string) => ({
    _id: { toString: () => id } as any,
    placeId: { toString: () => placeId } as any,
    playerId: { toString: () => playerId } as any,
    gameId: { toString: () => gameId } as any,
    jobOffers: [],
    content: {},
  });

  const createMockVehicle = (id: string, playerId: string, currentPlaceInstanceId: string | null, status: 'AT_PLACE' | 'IN_TRANSIT' = 'AT_PLACE') => ({
    _id: { toString: () => id } as any,
    vehicle: { _id: { toString: () => 'vehicle-template-1' } as any, name: 'Locomotive', speed: 0.1 },
    currentPlaceInstance: currentPlaceInstanceId ? currentPlaceInstanceId : null,
    destinationPlaceInstance: null,
    route: [],
    status,
    gameId: { toString: () => gameId } as any,
    playerId: { toString: () => playerId } as any,
    content: {}
  });

  const createMockConnection = (startPlaceId: string, endPlaceId: string) => ({
    _id: { toString: () => 'conn-1' } as any,
    startId: { toString: () => startPlaceId } as any,
    endId: { toString: () => endPlaceId } as any,
    content: { routePoints: [{ lat: 0, lng: 0 }, { lat: 1, lng: 1 }] }
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    // Setup mock implementations
    (VehicleInstancesService as jest.Mock).mockImplementation(() => mockVehicleInstancesService);
    (PlaceInstancesService as jest.Mock).mockImplementation(() => mockPlaceInstancesService);
    (PlaceConnectionService as jest.Mock).mockImplementation(() => mockPlaceConnectionService);
    (JobsService as jest.Mock).mockImplementation(() => mockJobsService);
    (PlacesService as jest.Mock).mockImplementation(() => mockPlacesService);
    (EconomyService as jest.Mock).mockImplementation(() => mockEconomyService);
    (InMemorySchedulerService as jest.Mock).mockImplementation(() => mockSchedulerService);

    mockSchedulerService.on.mockImplementation((event, handler) => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleDispatchService,
        { provide: VehicleInstancesService, useValue: mockVehicleInstancesService },
        { provide: PlaceInstancesService, useValue: mockPlaceInstancesService },
        { provide: PlaceConnectionService, useValue: mockPlaceConnectionService },
        { provide: JobsService, useValue: mockJobsService },
        { provide: PlacesService, useValue: mockPlacesService },
        { provide: EconomyService, useValue: mockEconomyService },
        { provide: InMemorySchedulerService, useValue: mockSchedulerService }
      ],
    }).compile();

    service = module.get<VehicleDispatchService>(VehicleDispatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('dispatch', () => {
    it('should successfully dispatch a vehicle with a valid route', async () => {
      const mockVehicle = createMockVehicle(vehicleId, playerId, place1Id);
      const mockPlace1 = createMockPlaceInstance(place1Id, playerId, 'place-template-1', 'Place 1');
      const mockPlace2 = createMockPlaceInstance(place2Id, playerId, 'place-template-2', 'Place 2');
      const mockConnection = createMockConnection('place-template-1', 'place-template-2');

      mockVehicleInstancesService.findOne.mockResolvedValue(mockVehicle);
      mockPlaceInstancesService.findOne
        .mockResolvedValueOnce(mockPlace1)
        .mockResolvedValueOnce(mockPlace2)
        .mockResolvedValueOnce(mockPlace1)
        .mockResolvedValueOnce(mockPlace2);
      mockPlaceConnectionService.findAll.mockResolvedValue({ data: [mockConnection], total: 1, page: 1, pageSize: 10 } as any);
      mockVehicleInstancesService.update.mockResolvedValue(mockVehicle);

      const route = [place1Id, place2Id];
      const result = await service.dispatch(vehicleId, route);

      expect(result.success).toBe(true);
      expect(result.travelTimeMs).toBeDefined();
      expect(result.scheduledTaskId).toBe('task-123');
      expect(mockVehicleInstancesService.update).toHaveBeenCalled();
    });

    it('should reject dispatch if vehicle not found', async () => {
      mockVehicleInstancesService.findOne.mockResolvedValue(null);

      await expect(service.dispatch(vehicleId, [place1Id, place2Id]))
        .rejects.toThrow(NotFoundException);
    });

    it('should reject dispatch if vehicle is already in transit', async () => {
      const inTransitVehicle = createMockVehicle(vehicleId, playerId, null, 'IN_TRANSIT');
      mockVehicleInstancesService.findOne.mockResolvedValue(inTransitVehicle);

      const route = [place1Id, place2Id];
      const result = await service.dispatch(vehicleId, route);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Vehicle is already in transit');
    });

    it('should reject route with less than 2 stops', async () => {
      const mockVehicle = createMockVehicle(vehicleId, playerId, place1Id);
      mockVehicleInstancesService.findOne.mockResolvedValue(mockVehicle);

      const result1 = await service.dispatch(vehicleId, []);
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('Route must have at least 2 stops');

      const result2 = await service.dispatch(vehicleId, [place1Id]);
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Route must have at least 2 stops');
    });

    it('should reject route that does not start at current location', async () => {
      const mockVehicle = createMockVehicle(vehicleId, playerId, place1Id);
      mockVehicleInstancesService.findOne.mockResolvedValue(mockVehicle);

      const route = [place2Id, place3Id]; // Does not start at vehicle's current place
      const result = await service.dispatch(vehicleId, route);

      expect(result.success).toBe(false);
      expect(result.error).toContain('must start at vehicle\'s current location');
    });

    it('should reject route with invalid connection', async () => {
      const mockVehicle = createMockVehicle(vehicleId, playerId, place1Id);
      const mockPlace1 = createMockPlaceInstance(place1Id, playerId, 'place-template-1', 'Place 1');
      const mockPlace2 = createMockPlaceInstance(place2Id, playerId, 'place-template-2', 'Place 2');

      mockVehicleInstancesService.findOne.mockResolvedValue(mockVehicle);
      mockPlaceInstancesService.findOne.mockResolvedValueOnce(mockPlace1).mockResolvedValueOnce(mockPlace2);
      mockPlaceConnectionService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 10 } as any);

      const route = [place1Id, place2Id];
      await expect(service.dispatch(vehicleId, route)).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateRoute', () => {
    it('should pass for valid route with existing connection', async () => {
      const mockPlace1 = createMockPlaceInstance(place1Id, playerId, 'place-template-1', 'Place 1');
      const mockPlace2 = createMockPlaceInstance(place2Id, playerId, 'place-template-2', 'Place 2');
      const mockConnection = createMockConnection('place-template-1', 'place-template-2');

      mockPlaceInstancesService.findOne.mockResolvedValueOnce(mockPlace1).mockResolvedValueOnce(mockPlace2);
      mockPlaceConnectionService.findAll.mockResolvedValue({ data: [mockConnection], total: 1, page: 1, pageSize: 10 } as any);

      const route = [place1Id, place2Id];
      await expect(service.validateRoute(route)).resolves.toBeUndefined();
    });

    it('should throw for missing connection', async () => {
      const mockPlace1 = createMockPlaceInstance(place1Id, playerId, 'place-template-1', 'Place 1');
      const mockPlace2 = createMockPlaceInstance(place2Id, playerId, 'place-template-2', 'Place 2');

      mockPlaceInstancesService.findOne.mockResolvedValueOnce(mockPlace1).mockResolvedValueOnce(mockPlace2);
      mockPlaceConnectionService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 10 } as any);

      const route = [place1Id, place2Id];
      await expect(service.validateRoute(route)).rejects.toThrow(BadRequestException);
    });

    it('should throw for invalid place in route', async () => {
      mockPlaceInstancesService.findOne.mockResolvedValue(null);

      const route = [place1Id, 'invalid-id'];
      await expect(service.validateRoute(route)).rejects.toThrow(BadRequestException);
    });
  });

  describe('calculateTravelTime', () => {
    it('should calculate travel time based on distance and vehicle speed', async () => {
      const mockVehicle = {
        ...createMockVehicle(vehicleId, playerId, place1Id),
        vehicle: { _id: { toString: () => 'vehicle-template-1' } as any, name: 'Locomotive', speed: 0.2 }
      };
      const mockPlace1 = createMockPlaceInstance(place1Id, playerId, 'place-template-1', 'Place 1');
      const mockPlace2 = createMockPlaceInstance(place2Id, playerId, 'place-template-2', 'Place 2');
      const mockConnection = createMockConnection('place-template-1', 'place-template-2');

      mockPlaceInstancesService.findOne.mockResolvedValueOnce(mockPlace1).mockResolvedValueOnce(mockPlace2);
      mockPlaceConnectionService.findAll.mockResolvedValue({ data: [mockConnection], total: 1, page: 1, pageSize: 10 } as any);

      const route = [place1Id, place2Id];
      const travelTime = await service.calculateTravelTime(mockVehicle as any, route);

      // Distance of mockConnection is approximately 157 km (haversine from lat 0,0 to lat 1,1)
      // At speed 0.2 km/ms, time = 157 / 0.2 = 785 ms
      expect(travelTime).toBeGreaterThan(0);
    });

    it('should handle multi-stop routes', async () => {
      const mockVehicle = createMockVehicle(vehicleId, playerId, place1Id);
      const mockPlace1 = createMockPlaceInstance(place1Id, playerId, 'place-template-1', 'Place 1');
      const mockPlace2 = createMockPlaceInstance(place2Id, playerId, 'place-template-2', 'Place 2');
      const mockPlace3 = createMockPlaceInstance(place3Id, playerId, 'place-template-3', 'Place 3');
      const mockConnection = createMockConnection('place-template-1', 'place-template-2');
      const mockConnection2 = createMockConnection('place-template-2', 'place-template-3');

      mockPlaceInstancesService.findOne
        .mockResolvedValueOnce(mockPlace1)
        .mockResolvedValueOnce(mockPlace2)
        .mockResolvedValueOnce(mockPlace2)
        .mockResolvedValueOnce(mockPlace3);
      mockPlaceConnectionService.findAll.mockResolvedValue({ data: [mockConnection, mockConnection2], total: 2, page: 1, pageSize: 10 } as any);

      const route = [place1Id, place2Id, place3Id];
      const travelTime = await service.calculateTravelTime(mockVehicle as any, route);

      // Should sum distances of both legs
      expect(travelTime).toBeGreaterThan(0);
    });
  });

  describe('getVehicleStatus', () => {
    it('should return vehicle status', async () => {
      const mockVehicle = createMockVehicle(vehicleId, playerId, place1Id);
      mockVehicleInstancesService.findOne.mockResolvedValue(mockVehicle);

      const status = await service.getVehicleStatus(vehicleId);
      expect(status).toEqual(mockVehicle);
    });

    it('should return null for non-existent vehicle', async () => {
      mockVehicleInstancesService.findOne.mockResolvedValue(null);

      const status = await service.getVehicleStatus('non-existent');
      expect(status).toBeNull();
    });
  });

  describe('cancelDispatch', () => {
    it('should return true if vehicle was in transit', async () => {
      const inTransitVehicle = createMockVehicle(vehicleId, playerId, null, 'IN_TRANSIT');
      mockVehicleInstancesService.findOne.mockResolvedValue(inTransitVehicle);

      const result = await service.cancelDispatch(vehicleId);
      expect(result).toBe(true);
    });

    it('should return false if vehicle was not in transit', async () => {
      const mockVehicle = createMockVehicle(vehicleId, playerId, place1Id);
      mockVehicleInstancesService.findOne.mockResolvedValue(mockVehicle);

      const result = await service.cancelDispatch(vehicleId);
      expect(result).toBe(false);
    });
  });

  describe('processArrival', () => {
    it('should process arrival and update vehicle position', async () => {
      const mockVehicle = {
        ...createMockVehicle(vehicleId, playerId, null, 'IN_TRANSIT'),
        route: [{ toString: () => place2Id } as any]
      };
      const mockPlace2 = createMockPlaceInstance(place2Id, playerId, 'place-template-2', 'Place 2');

      mockVehicleInstancesService.findOne.mockResolvedValue(mockVehicle);
      mockPlaceInstancesService.findOne.mockResolvedValue(mockPlace2);
      mockJobsService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 10 } as any);
      mockVehicleInstancesService.update.mockResolvedValue(mockVehicle);

      const payload: ArrivalPayload = {
        vehicleInstanceId: vehicleId,
        destinationPlaceInstanceId: place2Id,
        routeIndex: 1,
        remainingRoute: []
      };

      await service.processArrival(payload);

      expect(mockVehicleInstancesService.update).toHaveBeenCalled();
    });

    it('should deliver jobs when arriving at destination', async () => {
      const mockJob = {
        _id: { toString: () => 'job-1' } as any,
        vehicleInstanceId: { toString: () => vehicleId } as any,
        endPlaceId: { toString: () => place2Id } as any,
        pay: 100,
        payType: 'GOLD',
        content: {}
      };

      const mockVehicle = {
        ...createMockVehicle(vehicleId, playerId, null, 'IN_TRANSIT'),
        route: [{ toString: () => place2Id } as any],
        playerId: { toString: () => playerId } as any
      };

      const mockPlace2 = createMockPlaceInstance(place2Id, playerId, 'place-template-2', 'Place 2');

      mockVehicleInstancesService.findOne.mockResolvedValue(mockVehicle);
      mockPlaceInstancesService.findOne.mockResolvedValue(mockPlace2);
      mockJobsService.findAll.mockResolvedValue({ data: [mockJob], total: 1, page: 1, pageSize: 10 } as any);
      mockEconomyService.creditPlayer.mockResolvedValue({ success: true, newBalance: 100 });
      mockVehicleInstancesService.update.mockResolvedValue(mockVehicle);

      const payload: ArrivalPayload = {
        vehicleInstanceId: vehicleId,
        destinationPlaceInstanceId: place2Id,
        routeIndex: 1,
        remainingRoute: []
      };

      await service.processArrival(payload);

      expect(mockEconomyService.creditPlayer).toHaveBeenCalledWith(mockVehicle.playerId, CurrencyType.GOLD, 100);
    });

    it('should handle multi-stop arrivals by scheduling next leg', async () => {
      const mockVehicle = {
        ...createMockVehicle(vehicleId, playerId, null, 'IN_TRANSIT'),
        route: [{ toString: () => place2Id } as any, { toString: () => place3Id } as any],
        vehicle: { _id: { toString: () => 'vehicle-template-1' } as any, name: 'Locomotive', speed: 0.1 }
      };
      const mockPlace2 = createMockPlaceInstance(place2Id, playerId, 'place-template-2', 'Place 2');
      const mockPlace3 = createMockPlaceInstance(place3Id, playerId, 'place-template-3', 'Place 3');

      mockVehicleInstancesService.findOne.mockResolvedValue(mockVehicle);
      mockPlaceInstancesService.findOne.mockResolvedValueOnce(mockPlace2).mockResolvedValueOnce(mockPlace3);
      mockJobsService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 10 } as any);
      mockPlaceConnectionService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 10 } as any);
      mockVehicleInstancesService.update.mockResolvedValue(mockVehicle);

      const payload: ArrivalPayload = {
        vehicleInstanceId: vehicleId,
        destinationPlaceInstanceId: place2Id,
        routeIndex: 1,
        remainingRoute: [place2Id, place3Id]
      };

      await service.processArrival(payload);

      // Should schedule next arrival for remaining route
      expect(mockSchedulerService.schedule).toHaveBeenCalledWith(
        'vehicle:arrival',
        expect.any(Object),
        expect.any(Number)
      );
    });
  });
});
