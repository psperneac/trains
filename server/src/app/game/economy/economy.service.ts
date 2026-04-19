import { Injectable } from '@nestjs/common';
import { PlayersService } from '../../api/support/players.module';
import { TransactionsService, TransactionType, EntityType } from '../../api/support/transactions.module';

/**
 * Supported currency types for economy transactions.
 */
export enum CurrencyType {
  GOLD = 'GOLD',
  GEMS = 'GEMS',
}

/**
 * Result of a debit operation indicating success or failure reason.
 */
export interface DebitResult {
  success: boolean;
  error?: string;
  newBalance?: number;
}

/**
 * Result of a credit operation.
 */
export interface CreditResult {
  success: boolean;
  newBalance: number;
}

/**
 * Service for managing player economy transactions.
 *
 * The EconomyService handles all gold and gems operations for players,
 * including crediting (adding funds) and debiting (removing funds).
 * All transactions are logged via the TransactionService for audit trails.
 *
 * V1 Implementation:
 * - Only supports GOLD and GEMS currency types
 * - Does not support parts (reserved for future vehicle upgrade system)
 * - All operations are synchronous (no pending transactions)
 *
 * Usage:
 * ```
 * const economy = container.get(EconomyService);
 *
 * // Credit player
 * await economy.creditPlayer(playerId, CurrencyType.GOLD, 1000);
 *
 * // Debit player (returns result to check success)
 * const result = await economy.debitPlayer(playerId, CurrencyType.GEMS, 50);
 * if (!result.success) {
 *   console.log(result.error); // 'Insufficient gems'
 * }
 * ```
 */
@Injectable()
export class EconomyService {
  constructor(
    private readonly playersService: PlayersService,
    private readonly transactionsService: TransactionsService
  ) {}

  /**
   * Add funds to a player's wallet.
   *
   * Creates a transaction log entry for the credit operation.
   * Initializes the wallet if the player doesn't have one.
   *
   * @param playerId - The player's ID
   * @param currency - Type of currency (GOLD or GEMS)
   * @param amount - Amount to add (must be positive)
   * @returns Result containing success status and new balance
   * @throws Error if amount is negative or player not found
   */
  async creditPlayer(playerId: string, currency: CurrencyType, amount: number): Promise<CreditResult> {
    if (amount <= 0) {
      throw new Error('Credit amount must be positive');
    }

    const player = await this.playersService.findOne(playerId);
    if (!player) {
      throw new Error(`Player not found: ${playerId}`);
    }

    if (!player.wallet) {
      player.wallet = { gold: 0, gems: 0, parts: 0, content: {} };
    }

    if (currency === CurrencyType.GOLD) {
      player.wallet.gold += amount;
    } else {
      player.wallet.gems += amount;
    }

    await this.playersService.update(playerId, player);

    await this.logTransaction(
      playerId,
      currency,
      amount,
      'CREDIT',
      `Credited ${amount} ${currency.toLowerCase()} to player`
    );

    return {
      success: true,
      newBalance: currency === CurrencyType.GOLD ? player.wallet.gold : player.wallet.gems
    };
  }

  /**
   * Remove funds from a player's wallet.
   *
   * Creates a transaction log entry for the debit operation.
   * Does NOT allow negative balances - returns error if insufficient funds.
   *
   * @param playerId - The player's ID
   * @param currency - Type of currency (GOLD or GEMS)
   * @param amount - Amount to deduct (must be positive)
   * @returns Result indicating success or failure with reason
   * @throws Error if amount is negative
   */
  async debitPlayer(playerId: string, currency: CurrencyType, amount: number): Promise<DebitResult> {
    if (amount <= 0) {
      throw new Error('Debit amount must be positive');
    }

    const player = await this.playersService.findOne(playerId);
    if (!player) {
      return { success: false, error: `Player not found: ${playerId}` };
    }

    if (!player.wallet) {
      return { success: false, error: 'Player wallet not initialized' };
    }

    const currentBalance = currency === CurrencyType.GOLD ? player.wallet.gold : player.wallet.gems;

    if (currentBalance < amount) {
      return {
        success: false,
        error: `Insufficient ${currency.toLowerCase()}. Required: ${amount}, Available: ${currentBalance}`
      };
    }

    if (currency === CurrencyType.GOLD) {
      player.wallet.gold -= amount;
    } else {
      player.wallet.gems -= amount;
    }

    await this.playersService.update(playerId, player);

    await this.logTransaction(
      playerId,
      currency,
      amount,
      'DEBIT',
      `Debited ${amount} ${currency.toLowerCase()} from player`
    );

    return {
      success: true,
      newBalance: currency === CurrencyType.GOLD ? player.wallet.gold : player.wallet.gems
    };
  }

  /**
   * Get current wallet balance for a player.
   *
   * @param playerId - The player's ID
   * @param currency - Type of currency to check
   * @returns Current balance, or 0 if wallet doesn't exist
   */
  async getBalance(playerId: string, currency: CurrencyType): Promise<number> {
    const player = await this.playersService.findOne(playerId);
    if (!player || !player.wallet) {
      return 0;
    }

    return currency === CurrencyType.GOLD ? player.wallet.gold : player.wallet.gems;
  }

  /**
   * Check if player can afford a given amount.
   *
   * @param playerId - The player's ID
   * @param currency - Type of currency
   * @param amount - Amount to check
   * @returns true if player has sufficient funds
   */
  async canAfford(playerId: string, currency: CurrencyType, amount: number): Promise<boolean> {
    const balance = await this.getBalance(playerId, currency);
    return balance >= amount;
  }

  /**
   * Log a transaction for audit purposes.
   *
   * @param playerId - Target player ID
   * @param currency - Currency type used
   * @param amount - Transaction amount
   * @param direction - CREDIT or DEBIT
   * @param description - Human-readable description
   */
  private async logTransaction(
    playerId: string,
    currency: CurrencyType,
    amount: number,
    direction: 'CREDIT' | 'DEBIT',
    description: string
  ): Promise<void> {
    await this.transactionsService.createTransaction(
      direction === 'CREDIT' ? TransactionType.GAME_ACTION : TransactionType.GAME_ACTION,
      'SYSTEM',
      EntityType.USER,
      playerId,
      EntityType.PLAYER,
      {
        currency,
        amount,
        direction,
        balanceAfter: direction === 'CREDIT' ? 'N/A' : 'N/A' // Would need separate calculation for actual value
      },
      description
    );
  }
}