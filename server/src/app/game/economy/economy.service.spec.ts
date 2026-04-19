import { Test, TestingModule } from '@nestjs/testing';
import { CurrencyType } from './economy.service';

jest.mock('../../api/support/players.module', () => ({
  PlayersService: jest.fn().mockImplementation(() => ({
    findOne: jest.fn(),
    update: jest.fn(),
  })),
}));

jest.mock('../../api/support/transactions.module', () => ({
  TransactionsService: jest.fn().mockImplementation(() => ({
    createTransaction: jest.fn(),
  })),
  TransactionType: {
    GAME_ACTION: 'GAME_ACTION',
  },
  EntityType: {
    USER: 'USER',
    PLAYER: 'PLAYER',
  },
}));

import { PlayersService } from '../../api/support/players.module';
import { TransactionsService, TransactionType, EntityType } from '../../api/support/transactions.module';
import { EconomyService } from './economy.service';

describe('EconomyService', () => {
  let service: EconomyService;
  let mockPlayersService: { findOne: jest.Mock; update: jest.Mock };
  let mockTransactionsService: { createTransaction: jest.Mock };

  const createMockPlayer = (overrides = {}) => ({
    _id: { toString: () => 'player-123' } as any,
    name: 'Test Player',
    description: 'Test',
    userId: { toString: () => 'user-1' } as any,
    gameId: { toString: () => 'game-1' } as any,
    wallet: { gold: 1000, gems: 50, parts: 0, content: {} },
    content: {},
    created: new Date(),
    updated: new Date(),
    deleted: null as any,
    ...overrides
  });

  beforeEach(async () => {
    mockPlayersService = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    mockTransactionsService = {
      createTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EconomyService,
        { provide: PlayersService, useValue: mockPlayersService },
        { provide: TransactionsService, useValue: mockTransactionsService }
      ]
    }).compile();

    service = module.get<EconomyService>(EconomyService);
  });

  beforeEach(async () => {
    mockPlayersService = {
      findOne: jest.fn(),
      update: jest.fn(),
    } as any;

    mockTransactionsService = {
      createTransaction: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EconomyService,
        { provide: PlayersService, useValue: mockPlayersService },
        { provide: TransactionsService, useValue: mockTransactionsService }
      ]
    }).compile();

    service = module.get<EconomyService>(EconomyService);
  });

  describe('creditPlayer', () => {
    it('should add gold to player wallet', async () => {
      const mockPlayer = createMockPlayer();
      mockPlayersService.findOne.mockResolvedValue(mockPlayer);
      mockPlayersService.update.mockResolvedValue({ ...mockPlayer, wallet: { gold: 1500, gems: 50, parts: 0, content: {} } });

      const result = await service.creditPlayer('player-123', CurrencyType.GOLD, 500);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(1500);
      expect(mockPlayersService.update).toHaveBeenCalledWith('player-123', expect.objectContaining({
        wallet: expect.objectContaining({ gold: 1500 })
      }));
    });

    it('should add gems to player wallet', async () => {
      const mockPlayer = createMockPlayer();
      mockPlayersService.findOne.mockResolvedValue(mockPlayer);
      mockPlayersService.update.mockResolvedValue({ ...mockPlayer, wallet: { gold: 1000, gems: 150, parts: 0, content: {} } });

      const result = await service.creditPlayer('player-123', CurrencyType.GEMS, 100);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(150);
    });

    it('should initialize wallet if not present', async () => {
      const playerNoWallet = createMockPlayer({ wallet: undefined });
      mockPlayersService.findOne.mockResolvedValue(playerNoWallet);
      mockPlayersService.update.mockResolvedValue({ ...playerNoWallet, wallet: { gold: 500, gems: 0, parts: 0, content: {} } });

      const result = await service.creditPlayer('player-123', CurrencyType.GOLD, 500);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(500);
    });

    it('should throw error for negative amount', async () => {
      await expect(service.creditPlayer('player-123', CurrencyType.GOLD, -100))
        .rejects.toThrow('Credit amount must be positive');
    });

    it('should throw error for zero amount', async () => {
      await expect(service.creditPlayer('player-123', CurrencyType.GOLD, 0))
        .rejects.toThrow('Credit amount must be positive');
    });

    it('should throw error if player not found', async () => {
      mockPlayersService.findOne.mockResolvedValue(null);

      await expect(service.creditPlayer('player-123', CurrencyType.GOLD, 100))
        .rejects.toThrow('Player not found: player-123');
    });

    it('should log transaction on credit', async () => {
      const mockPlayer = createMockPlayer();
      mockPlayersService.findOne.mockResolvedValue(mockPlayer);
      mockPlayersService.update.mockResolvedValue(mockPlayer);

      await service.creditPlayer('player-123', CurrencyType.GOLD, 500);

      expect(mockTransactionsService.createTransaction).toHaveBeenCalledWith(
        TransactionType.GAME_ACTION,
        'SYSTEM',
        EntityType.USER,
        'player-123',
        EntityType.PLAYER,
        expect.objectContaining({ currency: CurrencyType.GOLD, amount: 500, direction: 'CREDIT' }),
        expect.stringContaining('Credited')
      );
    });
  });

  describe('debitPlayer', () => {
    it('should subtract gold from player wallet', async () => {
      const mockPlayer = createMockPlayer();
      mockPlayersService.findOne.mockResolvedValue(mockPlayer);
      mockPlayersService.update.mockResolvedValue({ ...mockPlayer, wallet: { gold: 500, gems: 50, parts: 0, content: {} } });

      const result = await service.debitPlayer('player-123', CurrencyType.GOLD, 500);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(500);
    });

    it('should subtract gems from player wallet', async () => {
      const mockPlayer = createMockPlayer();
      mockPlayersService.findOne.mockResolvedValue(mockPlayer);
      mockPlayersService.update.mockResolvedValue({ ...mockPlayer, wallet: { gold: 1000, gems: 25, parts: 0, content: {} } });

      const result = await service.debitPlayer('player-123', CurrencyType.GEMS, 25);

      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(25);
    });

    it('should return error if player not found', async () => {
      mockPlayersService.findOne.mockResolvedValue(null);

      const result = await service.debitPlayer('player-123', CurrencyType.GOLD, 100);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Player not found');
    });

    it('should return error if wallet not initialized', async () => {
      const mockPlayer = createMockPlayer({ wallet: undefined });
      mockPlayersService.findOne.mockResolvedValue(mockPlayer);

      const result = await service.debitPlayer('player-123', CurrencyType.GOLD, 100);

      expect(result.success).toBe(false);
      expect(result.error).toContain('wallet not initialized');
    });

    it('should return error if insufficient funds', async () => {
      const mockPlayer = createMockPlayer();
      mockPlayersService.findOne.mockResolvedValue(mockPlayer);

      const result = await service.debitPlayer('player-123', CurrencyType.GOLD, 2000);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient gold');
      expect(result.error).toContain('Required: 2000');
      expect(result.error).toContain('Available: 1000');
    });

    it('should throw error for negative amount', async () => {
      await expect(service.debitPlayer('player-123', CurrencyType.GOLD, -100))
        .rejects.toThrow('Debit amount must be positive');
    });

    it('should throw error for zero amount', async () => {
      await expect(service.debitPlayer('player-123', CurrencyType.GOLD, 0))
        .rejects.toThrow('Debit amount must be positive');
    });

    it('should log transaction on debit', async () => {
      const mockPlayer = createMockPlayer();
      mockPlayersService.findOne.mockResolvedValue(mockPlayer);
      mockPlayersService.update.mockResolvedValue(mockPlayer);

      await service.debitPlayer('player-123', CurrencyType.GOLD, 500);

      expect(mockTransactionsService.createTransaction).toHaveBeenCalledWith(
        TransactionType.GAME_ACTION,
        'SYSTEM',
        EntityType.USER,
        'player-123',
        EntityType.PLAYER,
        expect.objectContaining({ currency: CurrencyType.GOLD, amount: 500, direction: 'DEBIT' }),
        expect.stringContaining('Debited')
      );
    });
  });

  describe('getBalance', () => {
    it('should return gold balance', async () => {
      const mockPlayer = createMockPlayer();
      mockPlayersService.findOne.mockResolvedValue(mockPlayer);

      const balance = await service.getBalance('player-123', CurrencyType.GOLD);

      expect(balance).toBe(1000);
    });

    it('should return gems balance', async () => {
      const mockPlayer = createMockPlayer();
      mockPlayersService.findOne.mockResolvedValue(mockPlayer);

      const balance = await service.getBalance('player-123', CurrencyType.GEMS);

      expect(balance).toBe(50);
    });

    it('should return 0 if player not found', async () => {
      mockPlayersService.findOne.mockResolvedValue(null);

      const balance = await service.getBalance('player-123', CurrencyType.GOLD);

      expect(balance).toBe(0);
    });

    it('should return 0 if wallet not initialized', async () => {
      const mockPlayer = createMockPlayer({ wallet: undefined });
      mockPlayersService.findOne.mockResolvedValue(mockPlayer);

      const balance = await service.getBalance('player-123', CurrencyType.GOLD);

      expect(balance).toBe(0);
    });
  });

  describe('canAfford', () => {
    it('should return true when player has sufficient funds', async () => {
      const mockPlayer = createMockPlayer();
      mockPlayersService.findOne.mockResolvedValue(mockPlayer);

      const canAfford = await service.canAfford('player-123', CurrencyType.GOLD, 500);

      expect(canAfford).toBe(true);
    });

    it('should return false when player has insufficient funds', async () => {
      const mockPlayer = createMockPlayer();
      mockPlayersService.findOne.mockResolvedValue(mockPlayer);

      const canAfford = await service.canAfford('player-123', CurrencyType.GOLD, 2000);

      expect(canAfford).toBe(false);
    });

    it('should return false when player not found', async () => {
      mockPlayersService.findOne.mockResolvedValue(null);

      const canAfford = await service.canAfford('player-123', CurrencyType.GOLD, 100);

      expect(canAfford).toBe(false);
    });
  });

  describe('end-to-end scenarios', () => {
    it('should handle credit then debit transaction', async () => {
      const mockPlayer = createMockPlayer();
      mockPlayersService.findOne.mockResolvedValue(mockPlayer);
      mockPlayersService.update.mockResolvedValue(mockPlayer);

      await service.creditPlayer('player-123', CurrencyType.GOLD, 500);
      const creditResult = await service.creditPlayer('player-123', CurrencyType.GOLD, 300);

      expect(creditResult.newBalance).toBe(1800);

      mockPlayersService.update.mockResolvedValue({ ...mockPlayer, wallet: { gold: 1300, gems: 50, parts: 0, content: {} } });
      const debitResult = await service.debitPlayer('player-123', CurrencyType.GOLD, 500);

      expect(debitResult.success).toBe(true);
      expect(debitResult.newBalance).toBe(1300);
    });

    it('should handle multiple credits accumulate correctly', async () => {
      const mockPlayer = createMockPlayer();
      mockPlayersService.findOne.mockResolvedValue(mockPlayer);
      mockPlayersService.update.mockResolvedValue(mockPlayer);

      await service.creditPlayer('player-123', CurrencyType.GOLD, 100);
      mockPlayersService.update.mockResolvedValue({ ...mockPlayer, wallet: { gold: 1100, gems: 50, parts: 0, content: {} } });

      await service.creditPlayer('player-123', CurrencyType.GOLD, 200);
      mockPlayersService.update.mockResolvedValue({ ...mockPlayer, wallet: { gold: 1300, gems: 50, parts: 0, content: {} } });

      await service.creditPlayer('player-123', CurrencyType.GOLD, 300);
      const result = await service.creditPlayer('player-123', CurrencyType.GOLD, 400);

      expect(result.newBalance).toBe(2000);
    });
  });
});