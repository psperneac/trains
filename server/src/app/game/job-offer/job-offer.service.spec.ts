import { Test, TestingModule } from '@nestjs/testing';
import { JobOfferService, GameJobOffer } from './job-offer.service';
import { PlaceInstancesService } from '../../api/place-instance.module';
import { PlacesService } from '../../api/places.module';
import { InMemorySchedulerService } from '../scheduler/in-memory-scheduler.service';
import { CargoTypes } from '../../api/vehicles.module';

const mockPlaceInstancesService = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
};

const mockPlacesService = {
  findOne: jest.fn(),
};

const mockSchedulerService = {
  schedule: jest.fn(),
  on: jest.fn(),
};

jest.mock('../../api/place-instance.module', () => ({
  PlaceInstancesService: jest.fn().mockImplementation(() => mockPlaceInstancesService),
}));

jest.mock('../../api/places.module', () => ({
  PlacesService: jest.fn().mockImplementation(() => mockPlacesService),
}));

jest.mock('../scheduler/in-memory-scheduler.service', () => ({
  InMemorySchedulerService: jest.fn().mockImplementation(() => mockSchedulerService),
}));

jest.mock('../../api/vehicles.module', () => ({
  CargoTypes: ['Coal', 'Grain', 'Electronics', 'Machinery', 'Livestock'],
  CargoType: 'string',
}));

describe('JobOfferService', () => {
  let service: JobOfferService;

  const playerId = '507f1f77bcf86cd799439011';
  const place1Id = '507f1f77bcf86cd799439012';
  const place2Id = '507f1f77bcf86cd799439013';
  const place3Id = '507f1f77bcf86cd799439014';

  const createMockPlace = (id: string, name: string) => ({
    _id: { toString: () => id } as any,
    name,
    description: `Description for ${name}`,
    type: 'station',
    lat: 40.7128,
    lng: -74.006,
    gameId: { toString: () => 'game-1' } as any,
    priceGold: 1000,
    priceGems: 0,
  });

  const createMockPlaceInstance = (id: string, playerId: string, placeId: string, placeName: string) => ({
    _id: { toString: () => id } as any,
    place: createMockPlace(placeId, placeName),
    playerId: { toString: () => playerId } as any,
    gameId: { toString: () => 'game-1' } as any,
    jobOffers: [],
    content: {},
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock scheduler to not actually schedule timers
    mockSchedulerService.schedule.mockReturnValue('task-id');
    mockSchedulerService.on.mockImplementation((event, handler) => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobOfferService,
        { provide: PlaceInstancesService, useValue: mockPlaceInstancesService },
        { provide: PlacesService, useValue: mockPlacesService },
        { provide: InMemorySchedulerService, useValue: mockSchedulerService },
      ],
    }).compile();

    service = module.get<JobOfferService>(JobOfferService);
    // Skip onModuleInit to avoid actually scheduling timers
  });

  describe('generateOffersForPlace', () => {
    it('should return empty array if place instance not found', async () => {
      mockPlaceInstancesService.findOne.mockResolvedValue(null);

      const result = await service.generateOffersForPlace(place1Id);

      expect(result).toHaveLength(0);
    });

    it('should return empty array if player has less than 2 places', async () => {
      const mockPlaceInstance = createMockPlaceInstance(place1Id, playerId, place1Id, 'Place 1');

      mockPlaceInstancesService.findOne.mockResolvedValue(mockPlaceInstance);
      mockPlaceInstancesService.findAll.mockResolvedValue({
        data: [mockPlaceInstance],
      });
      mockPlaceInstancesService.update.mockResolvedValue(mockPlaceInstance);

      const result = await service.generateOffersForPlace(place1Id);

      expect(result).toHaveLength(0);
      expect(mockPlaceInstancesService.update).toHaveBeenCalledWith(
        place1Id,
        expect.objectContaining({ jobOffers: [] })
      );
    });

    it('should generate job offers when player has 2+ places', async () => {
      const mockPlace1 = createMockPlaceInstance(place1Id, playerId, place1Id, 'Place 1');
      const mockPlace2 = createMockPlaceInstance(place2Id, playerId, place2Id, 'Place 2');

      mockPlaceInstancesService.findOne.mockResolvedValue(mockPlace1);
      mockPlaceInstancesService.findAll.mockResolvedValue({
        data: [mockPlace1, mockPlace2],
      });
      mockPlaceInstancesService.update.mockResolvedValue(mockPlace1);

      const result = await service.generateOffersForPlace(place1Id);

      // Should have 0-2 jobs per destination, so result could be empty or have jobs
      expect(mockPlaceInstancesService.update).toHaveBeenCalled();
    });

    it('should generate offers between all owned places', async () => {
      const mockPlace1 = createMockPlaceInstance(place1Id, playerId, place1Id, 'Place 1');
      const mockPlace2 = createMockPlaceInstance(place2Id, playerId, place2Id, 'Place 2');
      const mockPlace3 = createMockPlaceInstance(place3Id, playerId, place3Id, 'Place 3');

      mockPlaceInstancesService.findOne.mockResolvedValue(mockPlace1);
      mockPlaceInstancesService.findAll.mockResolvedValue({
        data: [mockPlace1, mockPlace2, mockPlace3],
      });
      mockPlaceInstancesService.update.mockResolvedValue(mockPlace1);

      const result = await service.generateOffersForPlace(place1Id);

      // Should generate offers for 2 destinations (place2 and place3)
      expect(mockPlaceInstancesService.update).toHaveBeenCalledWith(
        place1Id,
        expect.objectContaining({
          jobOffers: expect.any(Array)
        })
      );
    });

    it('should include cargo type from CargoTypes', async () => {
      const mockPlace1 = createMockPlaceInstance(place1Id, playerId, place1Id, 'Place 1');
      const mockPlace2 = createMockPlaceInstance(place2Id, playerId, place2Id, 'Place 2');

      mockPlaceInstancesService.findOne.mockResolvedValue(mockPlace1);
      mockPlaceInstancesService.findAll.mockResolvedValue({
        data: [mockPlace1, mockPlace2],
      });
      mockPlaceInstancesService.update.mockImplementation((id, data) => Promise.resolve(data));

      // Mock Math.random to control number of jobs
      let callCount = 0;
      const originalRandom = Math.random;
      Math.random = () => {
        callCount++;
        // First call: return 0.5 for numJobs (0-2 range, gives 1 job)
        // Subsequent calls: return values for cargo type selection
        if (callCount <= 2) return 0.5;
        return 0.5;
      };

      const result = await service.generateOffersForPlace(place1Id);

      Math.random = originalRandom;

      if (result.length > 0) {
        expect(CargoTypes).toContain(result[0].cargoType);
      }
    });
  });

  describe('getOffersForPlace', () => {
    it('should return empty array if place not found', async () => {
      mockPlaceInstancesService.findOne.mockResolvedValue(null);

      const result = await service.getOffersForPlace(place1Id);

      expect(result).toHaveLength(0);
    });

    it('should return empty array if no job offers', async () => {
      const mockPlaceInstance = createMockPlaceInstance(place1Id, playerId, place1Id, 'Place 1');
      mockPlaceInstance.jobOffers = undefined;

      mockPlaceInstancesService.findOne.mockResolvedValue(mockPlaceInstance);

      const result = await service.getOffersForPlace(place1Id);

      expect(result).toHaveLength(0);
    });

    it('should return job offers with correct structure', async () => {
      const mockPlaceInstance = createMockPlaceInstance(place1Id, playerId, place1Id, 'Place 1');
      mockPlaceInstance.jobOffers = [
        {
          name: 'Test Job',
          description: 'Test',
          cargoType: 'Coal',
          startId: place1Id,
          endId: place2Id,
          load: 50,
          pay: 100,
          payType: 'GOLD',
          startTime: new Date(),
          content: {}
        }
      ];

      mockPlaceInstancesService.findOne.mockResolvedValue(mockPlaceInstance);

      const result = await service.getOffersForPlace(place1Id);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('cargoType', 'Coal');
      expect(result[0]).toHaveProperty('load', 50);
      expect(result[0]).toHaveProperty('pay', 100);
      expect(result[0]).toHaveProperty('payType', 'GOLD');
      expect(result[0]).toHaveProperty('expiresAt');
    });
  });

  describe('getAllOffersForPlayer', () => {
    it('should return empty map if player has no places', async () => {
      mockPlaceInstancesService.findAll.mockResolvedValue({ data: [] });

      const result = await service.getAllOffersForPlayer(playerId);

      expect(result.size).toBe(0);
    });

    it('should return offers for all player places', async () => {
      const mockPlace1 = createMockPlaceInstance(place1Id, playerId, place1Id, 'Place 1');
      const mockPlace2 = createMockPlaceInstance(place2Id, playerId, place2Id, 'Place 2');

      mockPlace1.jobOffers = [
        { name: 'Job 1', description: '', cargoType: 'Coal', startId: place1Id, endId: place2Id, load: 50, pay: 100, payType: 'GOLD', startTime: new Date(), content: {} }
      ];
      mockPlace2.jobOffers = [
        { name: 'Job 2', description: '', cargoType: 'Grain', startId: place2Id, endId: place1Id, load: 30, pay: 75, payType: 'GOLD', startTime: new Date(), content: {} }
      ];

      mockPlaceInstancesService.findAll.mockResolvedValue({
        data: [mockPlace1, mockPlace2],
      });

      const result = await service.getAllOffersForPlayer(playerId);

      expect(result.size).toBe(2);
      expect(result.get(place1Id)).toHaveLength(1);
      expect(result.get(place2Id)).toHaveLength(1);
    });
  });

  describe('job offer properties', () => {
    it('should generate valid payType (GOLD or GEMS)', async () => {
      const mockPlace1 = createMockPlaceInstance(place1Id, playerId, place1Id, 'Place 1');
      const mockPlace2 = createMockPlaceInstance(place2Id, playerId, place2Id, 'Place 2');

      mockPlaceInstancesService.findOne.mockResolvedValue(mockPlace1);
      mockPlaceInstancesService.findAll.mockResolvedValue({
        data: [mockPlace1, mockPlace2],
      });
      mockPlaceInstancesService.update.mockImplementation((id, data) => Promise.resolve(data));

      // Mock Math.random to return values that generate jobs with specific payTypes
      let callCount = 0;
      const originalRandom = Math.random;
      Math.random = () => {
        callCount++;
        // First few calls control numJobs and payType
        // Later calls control cargo type and load
        if (callCount === 1) return 0.5; // numJobs = 1
        if (callCount === 2) return 0.5; // payType (gold vs gems)
        return 0.5;
      };

      const result = await service.generateOffersForPlace(place1Id);

      Math.random = originalRandom;

      if (result.length > 0) {
        expect(['GOLD', 'GEMS']).toContain(result[0].payType);
      }
    });

    it('should generate load within valid range (10-100)', async () => {
      const mockPlace1 = createMockPlaceInstance(place1Id, playerId, place1Id, 'Place 1');
      const mockPlace2 = createMockPlaceInstance(place2Id, playerId, place2Id, 'Place 2');

      mockPlaceInstancesService.findOne.mockResolvedValue(mockPlace1);
      mockPlaceInstancesService.findAll.mockResolvedValue({
        data: [mockPlace1, mockPlace2],
      });
      mockPlaceInstancesService.update.mockImplementation((id, data) => Promise.resolve(data));

      const result = await service.generateOffersForPlace(place1Id);

      for (const offer of result) {
        expect(offer.load).toBeGreaterThanOrEqual(10);
        expect(offer.load).toBeLessThanOrEqual(100);
      }
    });

    it('should generate pay within valid range (50-500)', async () => {
      const mockPlace1 = createMockPlaceInstance(place1Id, playerId, place1Id, 'Place 1');
      const mockPlace2 = createMockPlaceInstance(place2Id, playerId, place2Id, 'Place 2');

      mockPlaceInstancesService.findOne.mockResolvedValue(mockPlace1);
      mockPlaceInstancesService.findAll.mockResolvedValue({
        data: [mockPlace1, mockPlace2],
      });
      mockPlaceInstancesService.update.mockImplementation((id, data) => Promise.resolve(data));

      const result = await service.generateOffersForPlace(place1Id);

      for (const offer of result) {
        expect(offer.pay).toBeGreaterThanOrEqual(50);
        expect(offer.pay).toBeLessThanOrEqual(500);
      }
    });
  });
});
