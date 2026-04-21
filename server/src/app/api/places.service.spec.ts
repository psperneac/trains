import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { PlacesService, Place } from './places.module';

describe('PlacesService', () => {
  let service: PlacesService;

  const mockGameId = new ObjectId();
  const mockPlaceId = new ObjectId();

  const createMockPlace = (overrides?: Partial<Place>): Place => ({
    _id: new Types.ObjectId(),
    name: 'Test Place',
    description: 'A test place',
    type: 'STATION',
    lat: 40.7128,
    lng: -74.006,
    gameId: mockGameId,
    priceGold: 1000,
    priceGems: 0,
    created: new Date(),
    updated: new Date(),
    deleted: null as any,
    ...overrides,
  } as Place);

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
    service = new PlacesService(mockModel as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByGameId', () => {
    it('should find places by gameId', async () => {
      const mockPlace = createMockPlace();
      (mockPlace as any).toObject = jest.fn().mockReturnValue(mockPlace);
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockPlace]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findByGameId(mockGameId.toString(), { unpaged: true } as any);

      expect(result.data).toHaveLength(1);
      expect(mockModel.find).toHaveBeenCalledWith({ gameId: expect.any(Types.ObjectId) });
    });

    it('should return empty result when no places found', async () => {
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

  describe('copyPlaces', () => {
    it('should copy places from source to target game', async () => {
      const sourcePlace = createMockPlace({ name: 'Place 1' });
      const targetGameId = new ObjectId();
      let callCount = 0;

      mockModel.find.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([sourcePlace]),
          };
        }
        return {
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([]),
        };
      });

      const result = await service.copyPlaces(mockGameId.toString(), targetGameId.toString(), false);

      expect(result.copiedCount).toBe(1);
      expect(mockModel.create).toHaveBeenCalled();
    });

    it('should skip existing places when overwrite is false', async () => {
      const sourcePlace = createMockPlace({ name: 'Existing Place' });
      const targetPlace = createMockPlace({ name: 'Existing Place', _id: new Types.ObjectId() });
      let callCount = 0;

      mockModel.find.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([sourcePlace]),
          };
        }
        return {
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([targetPlace]),
        };
      });

      const result = await service.copyPlaces(mockGameId.toString(), new ObjectId().toString(), false);

      expect(result.skippedCount).toBe(1);
      expect(result.copiedCount).toBe(0);
    });

    it('should overwrite existing places when overwrite is true', async () => {
      const sourcePlace = createMockPlace({ name: 'Existing Place', description: 'Updated description' });
      const targetPlace = createMockPlace({ name: 'Existing Place', description: 'Original description', _id: new Types.ObjectId() });
      let callCount = 0;

      mockModel.find.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([sourcePlace]),
          };
        }
        return {
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([targetPlace]),
        };
      });

      const mockSave = jest.fn().mockResolvedValue(targetPlace);
      (targetPlace as any).save = mockSave;

      const result = await service.copyPlaces(mockGameId.toString(), new ObjectId().toString(), true);

      expect(result.overwrittenCount).toBe(1);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('deleteAllByGameId', () => {
    it('should delete all places for a game', async () => {
      mockModel.deleteMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 3 }),
      });

      const result = await service.deleteAllByGameId(mockGameId.toString());

      expect(result).toBe(3);
      expect(mockModel.deleteMany).toHaveBeenCalledWith({ gameId: expect.any(Types.ObjectId) });
    });

    it('should return 0 when no places deleted', async () => {
      mockModel.deleteMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      const result = await service.deleteAllByGameId(mockGameId.toString());

      expect(result).toBe(0);
    });
  });
});
