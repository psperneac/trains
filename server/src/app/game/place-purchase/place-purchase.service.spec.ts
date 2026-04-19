import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { PlacePurchaseService, PurchasePlaceDto, PurchasePlaceResult } from './place-purchase.service';
import { PlayersService } from '../../api/support/players.module';
import { PlacesService } from '../../api/places.module';
import { PlaceInstancesService } from '../../api/place-instance.module';
import { EconomyService, CurrencyType } from '../economy/economy.service';
import { MapRevealService } from '../map-reveal/map-reveal.service';

const mockPlayersService = {
  findOne: jest.fn(),
};

const mockPlacesService = {
  findOne: jest.fn(),
};

const mockPlaceInstancesService = {
  create: jest.fn(),
};

const mockEconomyService = {
  debitPlayer: jest.fn(),
  creditPlayer: jest.fn(),
};

const mockMapRevealService = {
  getOwnedPlaceInstances: jest.fn(),
  getAvailablePlaces: jest.fn(),
};

jest.mock('../../api/support/players.module', () => ({
  PlayersService: jest.fn().mockImplementation(() => mockPlayersService),
}));

jest.mock('../../api/places.module', () => ({
  PlacesService: jest.fn().mockImplementation(() => mockPlacesService),
}));

jest.mock('../../api/place-instance.module', () => ({
  PlaceInstancesService: jest.fn().mockImplementation(() => mockPlaceInstancesService),
}));

jest.mock('../economy/economy.service', () => ({
  EconomyService: jest.fn().mockImplementation(() => mockEconomyService),
  CurrencyType: {
    GOLD: 'GOLD',
    GEMS: 'GEMS',
  },
}));

jest.mock('../map-reveal/map-reveal.service', () => ({
  MapRevealService: jest.fn().mockImplementation(() => mockMapRevealService),
}));

describe('PlacePurchaseService', () => {
  let service: PlacePurchaseService;

  const playerId = '507f1f77bcf86cd799439011';
  const placeId = '507f1f77bcf86cd799439012';

  const createMockPlayer = (overrides = {}) => ({
    _id: { toString: () => playerId } as any,
    name: 'Test Player',
    description: 'Test',
    userId: { toString: () => 'user-1' } as any,
    gameId: { toString: () => 'game-1' } as any,
    wallet: { gold: 5000, gems: 100, parts: 0, content: {} },
    content: {},
    ...overrides
  });

  const createMockPlace = (overrides = {}) => ({
    _id: { toString: () => placeId } as any,
    name: 'Test Place',
    description: 'A test place',
    type: 'station',
    lat: 40.7128,
    lng: -74.006,
    gameId: { toString: () => 'game-1' } as any,
    priceGold: 1000,
    priceGems: 0,
    ...overrides
  });

  const createMockPlaceInstance = (playerId: string, placeId: string) => ({
    _id: { toString: () => new ObjectId().toString() } as any,
    place: createMockPlace({ _id: { toString: () => placeId } as any }),
    playerId: { toString: () => playerId } as any,
    gameId: { toString: () => 'game-1' } as any,
    jobOffers: [],
    content: {},
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacePurchaseService,
        { provide: PlayersService, useValue: mockPlayersService },
        { provide: PlacesService, useValue: mockPlacesService },
        { provide: PlaceInstancesService, useValue: mockPlaceInstancesService },
        { provide: EconomyService, useValue: mockEconomyService },
        { provide: MapRevealService, useValue: mockMapRevealService },
      ],
    }).compile();

    service = module.get<PlacePurchaseService>(PlacePurchaseService);
  });

  describe('purchasePlace', () => {
    it('should successfully purchase a place', async () => {
      const mockPlayer = createMockPlayer();
      const mockPlace = createMockPlace();
      const mockPlaceInstance = createMockPlaceInstance(playerId, placeId);

      mockPlayersService.findOne.mockResolvedValue(mockPlayer);
      mockPlacesService.findOne.mockResolvedValue(mockPlace);
      mockMapRevealService.getOwnedPlaceInstances.mockResolvedValue([createMockPlaceInstance(playerId, 'other-place')]);
      mockMapRevealService.getAvailablePlaces.mockResolvedValue([mockPlace]);
      mockEconomyService.debitPlayer.mockResolvedValue({ success: true, newBalance: 4000 });
      mockPlaceInstancesService.create.mockResolvedValue(mockPlaceInstance);

      const result = await service.purchasePlace(playerId, placeId);

      expect(result.success).toBe(true);
      expect(result.placeInstance).toEqual(mockPlaceInstance);
      expect(mockEconomyService.debitPlayer).toHaveBeenCalledWith(playerId, CurrencyType.GOLD, 1000);
    });

    it('should throw NotFoundException if player not found', async () => {
      mockPlayersService.findOne.mockResolvedValue(null);

      await expect(service.purchasePlace(playerId, placeId))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if place not found', async () => {
      mockPlayersService.findOne.mockResolvedValue(createMockPlayer());
      mockPlacesService.findOne.mockResolvedValue(null);

      await expect(service.purchasePlace(playerId, placeId))
        .rejects.toThrow(NotFoundException);
    });

    it('should return error if player already owns the place', async () => {
      const mockPlayer = createMockPlayer();
      const mockPlace = createMockPlace();
      const existingPlaceInstance = createMockPlaceInstance(playerId, placeId);

      mockPlayersService.findOne.mockResolvedValue(mockPlayer);
      mockPlacesService.findOne.mockResolvedValue(mockPlace);
      mockMapRevealService.getOwnedPlaceInstances.mockResolvedValue([existingPlaceInstance]);

      const result = await service.purchasePlace(playerId, placeId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already own');
    });

    it('should return error if place is not available', async () => {
      const mockPlayer = createMockPlayer();
      const mockPlace = createMockPlace();

      mockPlayersService.findOne.mockResolvedValue(mockPlayer);
      mockPlacesService.findOne.mockResolvedValue(mockPlace);
      mockMapRevealService.getOwnedPlaceInstances.mockResolvedValue([createMockPlaceInstance(playerId, 'other-place')]);
      mockMapRevealService.getAvailablePlaces.mockResolvedValue([]);

      const result = await service.purchasePlace(playerId, placeId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not available');
    });

    it('should return error if player cannot afford gold', async () => {
      const mockPlayer = createMockPlayer({ wallet: { gold: 500, gems: 0, parts: 0, content: {} } });
      const mockPlace = createMockPlace({ priceGold: 1000, priceGems: 0 });

      mockPlayersService.findOne.mockResolvedValue(mockPlayer);
      mockPlacesService.findOne.mockResolvedValue(mockPlace);
      mockMapRevealService.getOwnedPlaceInstances.mockResolvedValue([createMockPlaceInstance(playerId, 'other-place')]);
      mockMapRevealService.getAvailablePlaces.mockResolvedValue([mockPlace]);
      mockEconomyService.debitPlayer.mockResolvedValue({
        success: false,
        error: 'Insufficient gold. Required: 1000, Available: 500'
      });

      const result = await service.purchasePlace(playerId, placeId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot afford');
    });

    it('should deduct both gold and gems when place costs both', async () => {
      const mockPlayer = createMockPlayer({ wallet: { gold: 5000, gems: 100, parts: 0, content: {} } });
      const mockPlace = createMockPlace({ priceGold: 1000, priceGems: 50 });
      const mockPlaceInstance = createMockPlaceInstance(playerId, placeId);

      mockPlayersService.findOne.mockResolvedValue(mockPlayer);
      mockPlacesService.findOne.mockResolvedValue(mockPlace);
      mockMapRevealService.getOwnedPlaceInstances.mockResolvedValue([createMockPlaceInstance(playerId, 'other-place')]);
      mockMapRevealService.getAvailablePlaces.mockResolvedValue([mockPlace]);
      mockEconomyService.debitPlayer
        .mockResolvedValueOnce({ success: true, newBalance: 4000 })
        .mockResolvedValueOnce({ success: true, newBalance: 50 });
      mockPlaceInstancesService.create.mockResolvedValue(mockPlaceInstance);

      const result = await service.purchasePlace(playerId, placeId);

      expect(result.success).toBe(true);
      expect(mockEconomyService.debitPlayer).toHaveBeenCalledWith(playerId, CurrencyType.GOLD, 1000);
      expect(mockEconomyService.debitPlayer).toHaveBeenCalledWith(playerId, CurrencyType.GEMS, 50);
    });

    it('should rollback gold if gems deduction fails', async () => {
      const mockPlayer = createMockPlayer({ wallet: { gold: 5000, gems: 100, parts: 0, content: {} } });
      const mockPlace = createMockPlace({ priceGold: 1000, priceGems: 50 });

      mockPlayersService.findOne.mockResolvedValue(mockPlayer);
      mockPlacesService.findOne.mockResolvedValue(mockPlace);
      mockMapRevealService.getOwnedPlaceInstances.mockResolvedValue([createMockPlaceInstance(playerId, 'other-place')]);
      mockMapRevealService.getAvailablePlaces.mockResolvedValue([mockPlace]);
      mockEconomyService.debitPlayer
        .mockResolvedValueOnce({ success: true, newBalance: 4000 })
        .mockResolvedValueOnce({ success: false, error: 'Insufficient gems' });

      const result = await service.purchasePlace(playerId, placeId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot afford');
      expect(mockEconomyService.creditPlayer).toHaveBeenCalledWith(playerId, CurrencyType.GOLD, 1000);
    });

    it('should create place instance with correct data', async () => {
      const mockPlayer = createMockPlayer();
      const mockPlace = createMockPlace();
      const mockPlaceInstance = createMockPlaceInstance(playerId, placeId);

      mockPlayersService.findOne.mockResolvedValue(mockPlayer);
      mockPlacesService.findOne.mockResolvedValue(mockPlace);
      mockMapRevealService.getOwnedPlaceInstances.mockResolvedValue([createMockPlaceInstance(playerId, 'other-place')]);
      mockMapRevealService.getAvailablePlaces.mockResolvedValue([mockPlace]);
      mockEconomyService.debitPlayer.mockResolvedValue({ success: true, newBalance: 4000 });
      mockPlaceInstancesService.create.mockResolvedValue(mockPlaceInstance);

      await service.purchasePlace(playerId, placeId);

      expect(mockPlaceInstancesService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          place: mockPlace,
          playerId: mockPlayer._id,
          gameId: mockPlayer.gameId,
          jobOffers: [],
          content: {}
        })
      );
    });

    it('should handle place with zero price (free place)', async () => {
      const mockPlayer = createMockPlayer();
      const mockPlace = createMockPlace({ priceGold: 0, priceGems: 0 });
      const mockPlaceInstance = createMockPlaceInstance(playerId, placeId);

      mockPlayersService.findOne.mockResolvedValue(mockPlayer);
      mockPlacesService.findOne.mockResolvedValue(mockPlace);
      mockMapRevealService.getOwnedPlaceInstances.mockResolvedValue([createMockPlaceInstance(playerId, 'other-place')]);
      mockMapRevealService.getAvailablePlaces.mockResolvedValue([mockPlace]);
      mockPlaceInstancesService.create.mockResolvedValue(mockPlaceInstance);

      const result = await service.purchasePlace(playerId, placeId);

      expect(result.success).toBe(true);
      expect(mockEconomyService.debitPlayer).not.toHaveBeenCalled();
    });
  });
});
