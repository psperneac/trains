import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { VehicleInstancesService, VehicleInstance } from './vehicle-instances.module';

describe('VehicleInstancesService', () => {
  let service: VehicleInstancesService;

  const mockPlayerId = new ObjectId();
  const mockVehicleId = new ObjectId();
  const mockGameId = new ObjectId();
  const mockPlaceInstanceId = new ObjectId();
  const mockVehicleInstanceId = new ObjectId();

  const createMockVehicleInstance = (overrides?: Partial<VehicleInstance>): VehicleInstance => ({
    _id: new Types.ObjectId(),
    vehicleId: mockVehicleId,
    currentPlaceInstanceId: mockPlaceInstanceId,
    destinationPlaceInstanceId: null,
    route: [],
    status: 'AT_PLACE' as const,
    gameId: mockGameId,
    playerId: mockPlayerId,
    content: {},
    created: new Date(),
    updated: new Date(),
    deleted: null as any,
    ...overrides,
  } as VehicleInstance);

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
    service = new VehicleInstancesService(mockModel as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllByPlayer', () => {
    it('should find vehicle instances by playerId', async () => {
      const mockVehicleInstance = createMockVehicleInstance();
      (mockVehicleInstance as any).toObject = jest.fn().mockReturnValue(mockVehicleInstance);
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockVehicleInstance]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAllByPlayer({ unpaged: true } as any, mockPlayerId.toString());

      expect(result.data).toHaveLength(1);
      expect(mockModel.find).toHaveBeenCalledWith({ playerId: expect.any(Types.ObjectId) });
    });

    it('should return empty result when no vehicle instances found', async () => {
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

  describe('findAllByVehicle', () => {
    it('should find vehicle instances by vehicleId', async () => {
      const mockVehicleInstance = createMockVehicleInstance();
      (mockVehicleInstance as any).toObject = jest.fn().mockReturnValue(mockVehicleInstance);
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockVehicleInstance]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAllByVehicle({ unpaged: true } as any, mockVehicleId.toString());

      expect(result.data).toHaveLength(1);
      expect(mockModel.find).toHaveBeenCalledWith({ vehicleId: expect.any(Types.ObjectId) });
    });
  });

  describe('findAllByPlayerAndMap', () => {
    it('should find vehicle instances by playerId (mapId not used in MongoDB implementation)', async () => {
      const mockVehicleInstance = createMockVehicleInstance();
      (mockVehicleInstance as any).toObject = jest.fn().mockReturnValue(mockVehicleInstance);
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockVehicleInstance]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAllByPlayerAndMap({ unpaged: true } as any, mockPlayerId.toString(), 'map-id');

      expect(result.data).toHaveLength(1);
    });
  });
});