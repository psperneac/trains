import { Test, TestingModule } from '@nestjs/testing';
import { MapRevealService, MapView } from './map-reveal.service';
import { PlaceInstancesService } from '../../api/place-instance.module';
import { PlaceConnectionService } from '../../api/place-connection.module';
import { PlacesService } from '../../api/places.module';

const mockPlaceInstancesService = {
  findAll: jest.fn(),
};

const mockPlaceConnectionService = {
  findAllWhere: jest.fn(),
};

const mockPlacesService = {
  findOne: jest.fn(),
};

jest.mock('../../api/place-instance.module', () => ({
  PlaceInstancesService: jest.fn().mockImplementation(() => mockPlaceInstancesService),
}));

jest.mock('../../api/place-connection.module', () => ({
  PlaceConnectionService: jest.fn().mockImplementation(() => mockPlaceConnectionService),
}));

jest.mock('../../api/places.module', () => ({
  PlacesService: jest.fn().mockImplementation(() => mockPlacesService),
}));

describe('MapRevealService', () => {
  let service: MapRevealService;

  // Valid 24-character hex strings for MongoDB ObjectIDs
  const place1Id = '507f1f77bcf86cd799439011';
  const place2Id = '507f1f77bcf86cd799439012';
  const place3Id = '507f1f77bcf86cd799439013';

  const createMockPlace = (id: string, name: string, gameId: string = 'game-1') => ({
    _id: { toString: () => id } as any,
    name,
    description: `Description for ${name}`,
    type: 'station',
    lat: 40.7128,
    lng: -74.006,
    gameId: { toString: () => gameId } as any,
    priceGold: 1000,
    priceGems: 0,
  });

  const createMockPlaceInstance = (id: string, playerId: string, placeId: string) => ({
    _id: { toString: () => id } as any,
    place: createMockPlace(placeId, `Place ${placeId}`),
    playerId,
    gameId: 'game-1',
    jobOffers: [],
    content: {},
  });

  const createMockConnection = (id: string, startId: string, endId: string, gameId: string = 'game-1') => ({
    _id: { toString: () => id } as any,
    startId: { toString: () => startId } as any,
    endId: { toString: () => endId } as any,
    gameId: { toString: () => gameId } as any,
    type: 'rail',
    name: `Connection ${startId} to ${endId}`,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapRevealService,
        { provide: PlaceInstancesService, useValue: mockPlaceInstancesService },
        { provide: PlaceConnectionService, useValue: mockPlaceConnectionService },
        { provide: PlacesService, useValue: mockPlacesService },
      ],
    }).compile();

    service = module.get<MapRevealService>(MapRevealService);
  });

  describe('getOwnedPlaceInstances', () => {
    it('should return all place instances for a player', async () => {
      const playerId = 'player-123';
      const mockPlaceInstances = [
        createMockPlaceInstance('pi-1', playerId, place1Id),
        createMockPlaceInstance('pi-2', playerId, place2Id),
      ];

      mockPlaceInstancesService.findAll.mockResolvedValue({
        data: [
          ...mockPlaceInstances,
          createMockPlaceInstance('pi-3', 'other-player', place3Id),
        ],
      });

      const result = await service.getOwnedPlaceInstances(playerId);

      expect(result).toHaveLength(2);
      expect(result[0].playerId).toBe(playerId);
      expect(result[1].playerId).toBe(playerId);
    });

    it('should return empty array if player has no place instances', async () => {
      mockPlaceInstancesService.findAll.mockResolvedValue({ data: [] });

      const result = await service.getOwnedPlaceInstances('player-with-nothing');

      expect(result).toHaveLength(0);
    });
  });

  describe('getAvailablePlaces', () => {
    it('should return places 1 hop from owned places', async () => {
      const playerId = 'player-123';

      mockPlaceInstancesService.findAll.mockResolvedValue({
        data: [createMockPlaceInstance('pi-1', playerId, place1Id)],
      });

      mockPlaceConnectionService.findAllWhere.mockResolvedValue({
        data: [createMockConnection('conn-1', place1Id, place2Id)],
      });

      mockPlacesService.findOne.mockResolvedValue(createMockPlace(place2Id, 'Available Place'));

      const result = await service.getAvailablePlaces(playerId);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Available Place');
    });

    it('should not return places already owned', async () => {
      const playerId = 'player-123';

      mockPlaceInstancesService.findAll.mockResolvedValue({
        data: [createMockPlaceInstance('pi-1', playerId, place1Id)],
      });

      mockPlaceConnectionService.findAllWhere.mockResolvedValue({
        data: [createMockConnection('conn-1', place1Id, place2Id)],
      });

      mockPlacesService.findOne.mockResolvedValue(createMockPlace(place2Id, 'Connected Place'));

      const result = await service.getAvailablePlaces(playerId);

      expect(result).toHaveLength(1);
      expect(result[0]._id.toString()).toBe(place2Id);
    });

    it('should return empty array if player has no owned places', async () => {
      mockPlaceInstancesService.findAll.mockResolvedValue({ data: [] });

      const result = await service.getAvailablePlaces('player-with-nothing');

      expect(result).toHaveLength(0);
    });

    it('should find places connected via multiple connections', async () => {
      const playerId = 'player-123';

      mockPlaceInstancesService.findAll.mockResolvedValue({
        data: [createMockPlaceInstance('pi-1', playerId, place1Id)],
      });

      mockPlaceConnectionService.findAllWhere.mockResolvedValue({
        data: [
          createMockConnection('conn-1', place1Id, place2Id),
          createMockConnection('conn-2', place2Id, place3Id),
        ],
      });

      // The algorithm collects ALL place IDs from connections (including transitive),
      // then filters out owned ones. So place2 and place3 are both "connected".
      mockPlacesService.findOne.mockImplementation((id: string) => {
        if (id === place2Id) return Promise.resolve(createMockPlace(place2Id, 'Place 2'));
        if (id === place3Id) return Promise.resolve(createMockPlace(place3Id, 'Place 3'));
        return Promise.resolve(null);
      });

      const result = await service.getAvailablePlaces(playerId);

      // Both place2 and place3 are in the connection graph (place1->place2->place3)
      // So both appear as "available" after filtering out owned (place1)
      expect(result).toHaveLength(2);
    });

    it('should handle bidirectional connections', async () => {
      const playerId = 'player-123';

      mockPlaceInstancesService.findAll.mockResolvedValue({
        data: [createMockPlaceInstance('pi-1', playerId, place1Id)],
      });

      mockPlaceConnectionService.findAllWhere.mockResolvedValue({
        data: [createMockConnection('conn-1', place1Id, place2Id)],
      });

      mockPlacesService.findOne.mockResolvedValue(createMockPlace(place2Id, 'Available Place'));

      const result = await service.getAvailablePlaces(playerId);

      expect(result).toHaveLength(1);
    });
  });

  describe('getMapView', () => {
    it('should return both owned and available places', async () => {
      const playerId = 'player-123';

      mockPlaceInstancesService.findAll.mockResolvedValue({
        data: [createMockPlaceInstance('pi-1', playerId, place1Id)],
      });

      mockPlaceConnectionService.findAllWhere.mockResolvedValue({
        data: [createMockConnection('conn-1', place1Id, place2Id)],
      });

      mockPlacesService.findOne.mockResolvedValue(createMockPlace(place2Id, 'Available Place'));

      const result = await service.getMapView(playerId);

      expect(result.owned).toHaveLength(1);
      expect(result.owned[0]._id.toString()).toBe(place1Id);
      expect(result.available).toHaveLength(1);
      expect(result.available[0]._id.toString()).toBe(place2Id);
    });

    it('should return empty arrays for player with no places', async () => {
      mockPlaceInstancesService.findAll.mockResolvedValue({ data: [] });

      const result = await service.getMapView('player-with-nothing');

      expect(result.owned).toHaveLength(0);
      expect(result.available).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle connection with missing place references', async () => {
      const playerId = 'player-123';

      mockPlaceInstancesService.findAll.mockResolvedValue({
        data: [createMockPlaceInstance('pi-1', playerId, place1Id)],
      });

      mockPlaceConnectionService.findAllWhere.mockResolvedValue({
        data: [
          {
            _id: { toString: () => 'conn-1' } as any,
            startId: null,
            endId: null,
            gameId: { toString: () => 'game-1' } as any,
          },
        ],
      });

      // findOne should return null when IDs are invalid/missing
      mockPlacesService.findOne.mockResolvedValue(null);

      const result = await service.getAvailablePlaces(playerId);

      expect(result).toHaveLength(0);
    });
  });
});
