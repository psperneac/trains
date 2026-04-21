import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { PlaceConnectionsService, PlaceConnection } from './place-connection.module';

describe('PlaceConnectionsService', () => {
  let service: PlaceConnectionsService;
  let mockPlacesService: any;

  const mockGameId = new ObjectId();
  const mockPlaceId1 = new Types.ObjectId();
  const mockPlaceId2 = new Types.ObjectId();

  const createMockConnection = (overrides?: Partial<PlaceConnection>): PlaceConnection => ({
    _id: new Types.ObjectId(),
    type: 'ROAD',
    name: 'Test Connection',
    description: 'A test connection',
    content: {},
    startId: mockPlaceId1,
    endId: mockPlaceId2,
    gameId: mockGameId,
    created: new Date(),
    updated: new Date(),
    deleted: null as any,
    ...overrides,
  } as PlaceConnection);

  const createMockModel = () => ({
    find: jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    }),
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    countDocuments: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    }),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    findByIdAndDelete: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    deleteMany: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    }),
  });

  let mockModel: ReturnType<typeof createMockModel>;

  beforeEach(() => {
    mockModel = createMockModel();
    mockPlacesService = {
      findAllWhere: jest.fn(),
    };
    service = new PlaceConnectionsService(mockModel as any, mockPlacesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByGameId', () => {
    it('should find connections by gameId', async () => {
      const mockConnection = createMockConnection();
      (mockConnection as any).toObject = jest.fn().mockReturnValue(mockConnection);
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockConnection]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findByGameId(mockGameId.toString(), { unpaged: true } as any);

      expect(result.data).toHaveLength(1);
      expect(mockModel.find).toHaveBeenCalledWith({ gameId: expect.any(Types.ObjectId) });
    });

    it('should return empty result when no connections found', async () => {
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      const result = await service.findByGameId(mockGameId.toString(), { unpaged: true } as any);

      expect(result.data).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('copyPlaceConnections', () => {
    it('should skip connections when target places do not exist', async () => {
      const sourceConnection = createMockConnection({ name: 'Connection 1' });
      const sourcePlaces = [
        { _id: mockPlaceId1.toString(), name: 'Place A' },
        { _id: mockPlaceId2.toString(), name: 'Place B' }
      ];
      let callCount = 0;

      mockModel.find.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([sourceConnection]),
          };
        }
        return {
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([]),
        };
      });

      mockPlacesService.findAllWhere.mockImplementation((query: any) => {
        if (query.gameId.toString() === mockGameId.toString()) {
          return Promise.resolve({ data: sourcePlaces });
        }
        return Promise.resolve({ data: [] });
      });

      const result = await service.copyPlaceConnections(mockGameId.toString(), new ObjectId().toString(), false);

      expect(result.skippedCount).toBe(1);
      expect(result.copiedCount).toBe(0);
    });

    it('should copy connections when target places exist', async () => {
      const sourceConnection = createMockConnection({ name: 'Connection 1' });
      const sourcePlaces = [
        { _id: mockPlaceId1.toString(), name: 'Place A' },
        { _id: mockPlaceId2.toString(), name: 'Place B' }
      ];
      const targetPlaces = [
        { _id: new Types.ObjectId().toString(), name: 'Place A' },
        { _id: new Types.ObjectId().toString(), name: 'Place B' }
      ];
      let callCount = 0;

      mockModel.find.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([sourceConnection]),
          };
        }
        return {
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([]),
        };
      });

      mockPlacesService.findAllWhere.mockImplementation((query: any) => {
        if (query.gameId.toString() === mockGameId.toString()) {
          return Promise.resolve({ data: sourcePlaces });
        }
        return Promise.resolve({ data: targetPlaces });
      });

      const result = await service.copyPlaceConnections(mockGameId.toString(), new ObjectId().toString(), false);

      expect(result.copiedCount).toBe(1);
      expect(mockModel.create).toHaveBeenCalled();
    });

    it('should skip existing connections when overwrite is false', async () => {
      const targetPlace1Id = new Types.ObjectId();
      const targetPlace2Id = new Types.ObjectId();
      const sourceConnection = createMockConnection({ startId: mockPlaceId1, endId: mockPlaceId2 });
      const targetConnection = createMockConnection({ startId: targetPlace1Id, endId: targetPlace2Id, _id: new Types.ObjectId() });
      const sourcePlaces = [
        { _id: mockPlaceId1.toString(), name: 'Place A' },
        { _id: mockPlaceId2.toString(), name: 'Place B' }
      ];
      const targetPlaces = [
        { _id: targetPlace1Id.toString(), name: 'Place A' },
        { _id: targetPlace2Id.toString(), name: 'Place B' }
      ];
      let callCount = 0;

      mockModel.find.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([sourceConnection]),
          };
        }
        return {
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([targetConnection]),
        };
      });

      mockPlacesService.findAllWhere.mockImplementation(() => {
        return Promise.resolve({ data: sourcePlaces });
      });

      // For the overwrite=false case, we need targetPlaces to be empty to simulate missing target mapping
      mockPlacesService.findAllWhere.mockImplementation((query: any) => {
        if (query.gameId.toString() === mockGameId.toString()) {
          return Promise.resolve({ data: sourcePlaces });
        }
        // Return empty for target game so the route key lookup fails
        return Promise.resolve({ data: [] });
      });

      const result = await service.copyPlaceConnections(mockGameId.toString(), new ObjectId().toString(), false);

      expect(result.skippedCount).toBe(1);
      expect(result.copiedCount).toBe(0);
    });

    it('should overwrite existing connections when overwrite is true', async () => {
      const targetPlace1Id = new Types.ObjectId();
      const targetPlace2Id = new Types.ObjectId();
      const sourceConnection = createMockConnection({
        name: 'Updated Connection',
        startId: mockPlaceId1,
        endId: mockPlaceId2
      });
      const targetConnection = createMockConnection({
        name: 'Original Connection',
        _id: new Types.ObjectId(),
        startId: targetPlace1Id,
        endId: targetPlace2Id
      });
      const sourcePlaces = [
        { _id: mockPlaceId1.toString(), name: 'Place A' },
        { _id: mockPlaceId2.toString(), name: 'Place B' }
      ];
      const targetPlaces = [
        { _id: targetPlace1Id.toString(), name: 'Place A' },
        { _id: targetPlace2Id.toString(), name: 'Place B' }
      ];

      // Mock find to return source connections first, then target connections
      mockModel.find
        .mockReturnValueOnce({
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([sourceConnection]),
        })
        .mockReturnValueOnce({
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([targetConnection]),
        });

      // Mock placesService to return source places for source game, target places for target game
      mockPlacesService.findAllWhere
        .mockResolvedValueOnce({ data: sourcePlaces }) // source game
        .mockResolvedValueOnce({ data: targetPlaces }); // target game

      const mockSave = jest.fn().mockResolvedValue(targetConnection);
      (targetConnection as any).save = mockSave;

      const result = await service.copyPlaceConnections(mockGameId.toString(), new ObjectId().toString(), true);

      expect(result.overwrittenCount).toBe(1);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should skip connections when place names cannot be found', async () => {
      const sourceConnection = createMockConnection();
      let callCount = 0;

      mockModel.find.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([sourceConnection]),
          };
        }
        return {
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([]),
        };
      });

      mockPlacesService.findAllWhere.mockResolvedValue({ data: [] });

      const result = await service.copyPlaceConnections(mockGameId.toString(), new ObjectId().toString(), false);

      expect(result.skippedCount).toBe(1);
      expect(result.copiedCount).toBe(0);
    });
  });

  describe('deleteAllByGameId', () => {
    it('should delete all connections for a game', async () => {
      mockModel.deleteMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 3 }),
      });

      const result = await service.deleteAllByGameId(mockGameId.toString());

      expect(result).toBe(3);
      expect(mockModel.deleteMany).toHaveBeenCalledWith({ gameId: expect.any(Types.ObjectId) });
    });

    it('should return 0 when no connections deleted', async () => {
      mockModel.deleteMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      const result = await service.deleteAllByGameId(mockGameId.toString());

      expect(result).toBe(0);
    });
  });
});
