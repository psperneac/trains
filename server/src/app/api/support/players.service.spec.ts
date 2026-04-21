import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { PlayersService, Player } from './players.module';

describe('PlayersService', () => {
  let service: PlayersService;

  const mockUserId = new ObjectId();
  const mockGameId = new ObjectId();
  const mockPlayerId = new ObjectId();

  const createMockPlayer = (overrides?: Partial<Player>): Player => ({
    _id: new Types.ObjectId(),
    name: 'Test Player',
    description: 'A test player',
    userId: mockUserId,
    gameId: mockGameId,
    wallet: { gold: 10000, gems: 100, parts: 0, content: {} },
    content: {},
    created: new Date(),
    updated: new Date(),
    deleted: null as any,
    ...overrides,
  } as Player);

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
    service = new PlayersService(mockModel as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllByUserId', () => {
    it('should find players by userId', async () => {
      const mockPlayer = createMockPlayer();
      (mockPlayer as any).toObject = jest.fn().mockReturnValue(mockPlayer);
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockPlayer]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAllByUserId(mockUserId.toString(), { unpaged: true } as any);

      expect(result.data).toHaveLength(1);
      expect(mockModel.find).toHaveBeenCalledWith({ userId: expect.any(Types.ObjectId) });
    });

    it('should return empty result when no players found', async () => {
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      const result = await service.findAllByUserId(mockUserId.toString(), { unpaged: true } as any);

      expect(result.data).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('findAllByGameId', () => {
    it('should find players by gameId', async () => {
      const mockPlayer = createMockPlayer();
      (mockPlayer as any).toObject = jest.fn().mockReturnValue(mockPlayer);
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockPlayer]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAllByGameId(mockGameId.toString(), { unpaged: true } as any);

      expect(result.data).toHaveLength(1);
      expect(mockModel.find).toHaveBeenCalledWith({ gameId: expect.any(Types.ObjectId) });
    });
  });

  describe('sendGoldAndGems', () => {
    it('should add gold, gems, and parts to player wallet', async () => {
      const mockPlayer = createMockPlayer({
        wallet: { gold: 1000, gems: 50, parts: 10, content: {} }
      });
      const mockUpdatedPlayer = createMockPlayer({
        wallet: { gold: 2000, gems: 150, parts: 60, content: {} }
      });
      (mockPlayer as any).toObject = jest.fn().mockReturnValue(mockPlayer);
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlayer),
      });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockUpdatedPlayer,
          toObject: jest.fn().mockReturnValue(mockUpdatedPlayer),
        }),
      });

      const result = await service.sendGoldAndGems(mockPlayerId.toString(), 1000, 100, 50);

      expect(result.wallet.gold).toBe(2000);
      expect(result.wallet.gems).toBe(150);
      expect(result.wallet.parts).toBe(60);
    });

    it('should initialize wallet if not exists', async () => {
      const mockPlayer = createMockPlayer({ wallet: undefined as any });
      const mockUpdatedPlayer = createMockPlayer({
        wallet: { gold: 1000, gems: 100, parts: 50, content: {} }
      });
      (mockPlayer as any).toObject = jest.fn().mockReturnValue(mockPlayer);
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlayer),
      });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockUpdatedPlayer,
          toObject: jest.fn().mockReturnValue(mockUpdatedPlayer),
        }),
      });

      const result = await service.sendGoldAndGems(mockPlayerId.toString(), 1000, 100, 50);

      expect(result).toBeDefined();
    });

    it('should throw error if player not found', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.sendGoldAndGems(mockPlayerId.toString(), 1000, 100, 50))
        .rejects.toThrow('Player not found');
    });
  });
});