import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { TransactionsService, Transaction, TransactionType, EntityType } from './transactions.module';

describe('TransactionsService', () => {
  let service: TransactionsService;

  const mockPlayerId = new ObjectId();
  const mockUserId = new ObjectId();
  const mockGameId = new ObjectId();

  const createMockTransaction = (overrides?: Partial<Transaction>): Transaction => ({
    _id: new Types.ObjectId(),
    type: TransactionType.GAME_ACTION,
    sourceId: mockPlayerId,
    sourceType: EntityType.PLAYER,
    targetId: mockUserId,
    targetType: EntityType.USER,
    payload: { amount: 100 },
    description: 'Test transaction',
    created: new Date(),
    updated: new Date(),
    deleted: null as any,
    ...overrides,
  } as Transaction);

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
    service = new TransactionsService(mockModel as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllByEntityId', () => {
    it('should find transactions by source or target entity', async () => {
      const mockTransaction = createMockTransaction();
      (mockTransaction as any).toObject = jest.fn().mockReturnValue(mockTransaction);
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTransaction]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAllByEntityId(mockPlayerId.toString(), EntityType.PLAYER, { unpaged: true } as any);

      expect(result.data).toHaveLength(1);
      expect(mockModel.find).toHaveBeenCalledWith({
        $or: [
          { sourceId: expect.any(ObjectId), sourceType: EntityType.PLAYER },
          { targetId: expect.any(ObjectId), targetType: EntityType.PLAYER }
        ]
      });
    });

    it('should return empty result when no transactions found', async () => {
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      const result = await service.findAllByEntityId(mockPlayerId.toString(), EntityType.PLAYER, { unpaged: true } as any);

      expect(result.data).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should query with correct entity type filter', async () => {
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.findAllByEntityId(mockUserId.toString(), EntityType.USER, { unpaged: true } as any);

      expect(mockModel.find).toHaveBeenCalledWith({
        $or: [
          { sourceId: expect.any(ObjectId), sourceType: EntityType.USER },
          { targetId: expect.any(ObjectId), targetType: EntityType.USER }
        ]
      });
    });
  });

  describe('findAllByPlayerId', () => {
    it('should delegate to findAllByEntityId with EntityType.PLAYER', async () => {
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await service.findAllByPlayerId(mockPlayerId.toString(), { unpaged: true } as any);

      expect(mockModel.find).toHaveBeenCalledWith({
        $or: [
          { sourceId: expect.any(ObjectId), sourceType: EntityType.PLAYER },
          { targetId: expect.any(ObjectId), targetType: EntityType.PLAYER }
        ]
      });
    });
  });

  describe('createTransaction', () => {
    it('should create a transaction with all fields', async () => {
      const mockTransaction = createMockTransaction();
      const mockSave = jest.fn().mockResolvedValue({
        ...mockTransaction,
        toObject: jest.fn().mockReturnValue(mockTransaction),
      });

      const MockModel = jest.fn().mockImplementation(function(this: any) {
        this.save = mockSave;
      });

      service = new TransactionsService(MockModel as any);

      await service.createTransaction(
        TransactionType.GOLD_GEMS_TRANSFER,
        mockPlayerId.toString(),
        EntityType.PLAYER,
        mockUserId.toString(),
        EntityType.USER,
        { amount: 100 },
        'Gold transfer'
      );

      expect(MockModel).toHaveBeenCalled();
    });
  });
});
