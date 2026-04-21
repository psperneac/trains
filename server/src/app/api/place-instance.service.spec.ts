import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { PlaceInstancesService, PlaceInstance } from './place-instance.module';

describe('PlaceInstancesService', () => {
  let service: PlaceInstancesService;

  const mockPlayerId = new ObjectId();
  const mockPlaceId = new ObjectId();
  const mockGameId = new ObjectId();
  const mockPlaceInstanceId = new ObjectId();

  const createMockPlaceInstance = (overrides?: Partial<PlaceInstance>): PlaceInstance => ({
    _id: new Types.ObjectId(),
    placeId: mockPlaceId,
    gameId: mockGameId,
    playerId: mockPlayerId,
    jobOffers: [
      {
        jobOfferId: 'offer-1',
        name: 'Job 1',
        description: 'Test job',
        cargoType: 'Coal',
        load: 100,
        pay: 500,
        payType: 'FIXED',
        startTime: new Date(),
        startId: new ObjectId(),
        endId: new ObjectId(),
        content: {},
      }
    ],
    content: {},
    created: new Date(),
    updated: new Date(),
    deleted: null as any,
    ...overrides,
  } as PlaceInstance);

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
  });

  let mockModel: ReturnType<typeof createMockModel>;

  beforeEach(() => {
    mockModel = createMockModel();
    service = new PlaceInstancesService(mockModel as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllByPlayer', () => {
    it('should find place instances by playerId', async () => {
      const mockPlaceInstance = createMockPlaceInstance();
      (mockPlaceInstance as any).toObject = jest.fn().mockReturnValue(mockPlaceInstance);
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockPlaceInstance]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAllByPlayer({ unpaged: true } as any, mockPlayerId.toString());

      expect(result.data).toHaveLength(1);
      expect(mockModel.find).toHaveBeenCalledWith({ playerId: expect.any(Types.ObjectId) });
    });

    it('should return empty result when no place instances found', async () => {
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      const result = await service.findAllByPlayer({ unpaged: true } as any, mockPlayerId.toString());

      expect(result.data).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('findJobOffer', () => {
    it('should find a job offer by jobOfferId', async () => {
      const mockPlaceInstance = createMockPlaceInstance();
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockPlaceInstance,
          toObject: jest.fn().mockReturnValue(mockPlaceInstance),
        }),
      });

      const result = await service.findJobOffer(mockPlaceInstanceId.toString(), 'offer-1');

      expect(result).not.toBeNull();
      expect(result?.jobOfferId).toBe('offer-1');
    });

    it('should return null when place instance not found', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findJobOffer(mockPlaceInstanceId.toString(), 'offer-1');

      expect(result).toBeNull();
    });

    it('should return null when job offer not found', async () => {
      const mockPlaceInstance = createMockPlaceInstance({ jobOffers: [] });
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockPlaceInstance,
          toObject: jest.fn().mockReturnValue(mockPlaceInstance),
        }),
      });

      const result = await service.findJobOffer(mockPlaceInstanceId.toString(), 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('removeJobOffer', () => {
    it('should remove a job offer from place instance', async () => {
      const mockPlaceInstance = createMockPlaceInstance();
      (mockPlaceInstance as any).toObject = jest.fn().mockReturnValue(mockPlaceInstance);

      const updatedInstance = {
        ...mockPlaceInstance,
        jobOffers: [],
        toObject: jest.fn().mockReturnValue({ ...mockPlaceInstance, jobOffers: [] }),
      };

      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockPlaceInstance,
          toObject: jest.fn().mockReturnValue(mockPlaceInstance),
        }),
      });

      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedInstance),
      });

      await service.removeJobOffer(mockPlaceInstanceId.toString(), 'offer-1');

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPlaceInstanceId.toString(),
        expect.objectContaining({ jobOffers: [] }),
        expect.any(Object)
      );
    });
  });
});