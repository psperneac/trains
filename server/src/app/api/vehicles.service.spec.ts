import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { VehiclesService, Vehicle } from './vehicles.module';

describe('VehiclesService', () => {
  let service: VehiclesService;

  const mockGameId = new ObjectId();
  const mockVehicleId = new ObjectId();

  const createMockVehicle = (overrides?: Partial<Vehicle>): Vehicle => ({
    _id: new Types.ObjectId(),
    type: 'STEAM',
    name: 'Test Vehicle',
    description: 'A test vehicle',
    content: {},
    engineMax: 100,
    engineLoad: 0,
    engineFuel: 100,
    auxMax: 50,
    auxLoad: 0,
    auxFuel: 50,
    speed: 60,
    gameId: mockGameId,
    priceGold: 5000,
    priceGems: 10,
    fuelBaseBurn: 1,
    fuelPerLoadBurn: 0.1,
    created: new Date(),
    updated: new Date(),
    deleted: null as any,
    ...overrides,
  } as Vehicle);

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
    service = new VehiclesService(mockModel as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByGameId', () => {
    it('should find vehicles by gameId', async () => {
      const mockVehicle = createMockVehicle();
      (mockVehicle as any).toObject = jest.fn().mockReturnValue(mockVehicle);
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockVehicle]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findByGameId(mockGameId.toString(), { unpaged: true } as any);

      expect(result.data).toHaveLength(1);
      expect(mockModel.find).toHaveBeenCalledWith({ gameId: expect.any(Types.ObjectId) });
    });

    it('should return empty result when no vehicles found', async () => {
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

    it('should handle pagination parameters', async () => {
      const mockVehicle = createMockVehicle();
      (mockVehicle as any).toObject = jest.fn().mockReturnValue(mockVehicle);
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockVehicle]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const pagination = { page: '1', limit: '10' };
      const result = await service.findByGameId(mockGameId.toString(), pagination as any);

      expect(result.data).toHaveLength(1);
      expect(mockModel.find).toHaveBeenCalled();
    });
  });
});