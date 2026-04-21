import { Test, TestingModule } from '@nestjs/testing';
import { ObjectId } from 'mongodb';
import { TransactionController, TransactionDto, EntityType, TransactionType } from './transactions.module';
import { TransactionsService } from './transactions.module';
import { TransactionMapper } from './transactions.module';
import { PageDto } from '../../../models/page.model';

describe('TransactionController', () => {
  let controller: TransactionController;
  let transactionsService: jest.Mocked<TransactionsService>;
  let transactionMapper: jest.Mocked<TransactionMapper>;

  const mockPlayerId = new ObjectId().toString();
  const mockUserId = new ObjectId().toString();
  const mockGameId = new ObjectId().toString();

  const createMockTransactionDto = (): TransactionDto => ({
    id: new ObjectId().toString(),
    type: TransactionType.GAME_ACTION,
    sourceId: mockPlayerId,
    sourceType: EntityType.PLAYER,
    targetId: mockUserId,
    targetType: EntityType.USER,
    payload: { amount: 100 },
    description: 'Test transaction',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  });

  beforeEach(async () => {
    const mockTransactionsServiceMethods = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAllByEntityId: jest.fn(),
      findAllByPlayerId: jest.fn(),
    };

    const mockTransactionMapperMethods = {
      toDto: jest.fn(),
      toDomain: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsServiceMethods },
        { provide: TransactionMapper, useValue: mockTransactionMapperMethods },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    transactionsService = module.get(TransactionsService);
    transactionMapper = module.get(TransactionMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllByPlayerId', () => {
    it('should return transactions for a player', async () => {
      const mockDto = createMockTransactionDto();
      const mockPage: PageDto<any> = {
        data: [{ ...mockDto, sourceId: mockPlayerId }],
        page: 1,
        limit: 10,
        totalCount: 1,
      };

      transactionsService.findAllByPlayerId.mockResolvedValue(mockPage);
      transactionMapper.toDto.mockResolvedValue(mockDto);

      const result = await controller.findAllByPlayerId(mockPlayerId, {} as any);

      expect(result.data).toHaveLength(1);
      expect(transactionsService.findAllByPlayerId).toHaveBeenCalledWith(mockPlayerId, {});
    });

    it('should return empty page when no transactions found', async () => {
      const mockPage: PageDto<any> = {
        data: [],
        page: 1,
        limit: 10,
        totalCount: 0,
      };

      transactionsService.findAllByPlayerId.mockResolvedValue(mockPage);
      transactionMapper.toDto.mockResolvedValue(null);

      const result = await controller.findAllByPlayerId(mockPlayerId, {} as any);

      expect(result.data).toHaveLength(0);
    });

    it('should pass pagination parameters to service', async () => {
      const mockPage: PageDto<any> = {
        data: [],
        page: 2,
        limit: 20,
        totalCount: 0,
      };

      transactionsService.findAllByPlayerId.mockResolvedValue(mockPage);

      const pagination = { page: '2', limit: '20' };
      await controller.findAllByPlayerId(mockPlayerId, pagination as any);

      expect(transactionsService.findAllByPlayerId).toHaveBeenCalledWith(mockPlayerId, pagination);
    });
  });

  describe('findAllByEntityId', () => {
    it('should return transactions for a specific entity', async () => {
      const mockDto = createMockTransactionDto();
      const mockPage: PageDto<any> = {
        data: [mockDto],
        page: 1,
        limit: 10,
        totalCount: 1,
      };

      transactionsService.findAllByEntityId.mockResolvedValue(mockPage);
      transactionMapper.toDto.mockResolvedValue(mockDto);

      const result = await controller.findAllByEntityId(mockPlayerId, EntityType.PLAYER, {} as any);

      expect(result.data).toHaveLength(1);
      expect(transactionsService.findAllByEntityId).toHaveBeenCalledWith(mockPlayerId, EntityType.PLAYER, {});
    });

    it('should handle different entity types', async () => {
      const mockDto = createMockTransactionDto();
      const mockPage: PageDto<any> = {
        data: [mockDto],
        page: 1,
        limit: 10,
        totalCount: 1,
      };

      transactionsService.findAllByEntityId.mockResolvedValue(mockPage);
      transactionMapper.toDto.mockResolvedValue(mockDto);

      await controller.findAllByEntityId(mockUserId, EntityType.USER, {} as any);

      expect(transactionsService.findAllByEntityId).toHaveBeenCalledWith(mockUserId, EntityType.USER, {});
    });
  });
});
