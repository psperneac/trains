import { Injectable } from '@nestjs/common';

/**
 * Game time synchronization result containing game time and drift information.
 */
export interface GameTimeSync {
  /** Current game time in milliseconds */
  gameTime: number;
  /** Drift between wall clock and game time in milliseconds */
  drift: number;
  /** Last synchronization timestamp in UTC */
  timestamp: Date;
}

/**
 * Service for managing game time independent of wall clock.
 *
 * The GameClockService tracks elapsed game time, separate from real-world time.
 * This allows the game to run at a different pace than real time, and enables
 * features like pausing, speed adjustment, and time manipulation (future).
 *
 * V1 Implementation:
 * - Game time starts at 0 when syncWithWallClock() is called
 * - getGameTime() returns elapsed milliseconds since last sync
 * - Future features (pause, resume, speed) are not implemented yet
 *
 * Usage:
 * ```
 * const gameClock = container.get(GameClockService);
 * gameClock.syncWithWallClock();
 * const elapsed = gameClock.getGameTime(); // milliseconds since sync
 * ```
 */
@Injectable()
export class GameClockService {
  /** Reference wall clock time when game time was last synchronized (Unix ms) */
  private wallClockSyncTime: number = 0;
  /** Running total of elapsed game time before current session (ms) */
  private accumulatedGameTime: number = 0;
  /** Whether the clock is currently synchronized with wall clock */
  private isSynchronized: boolean = false;

  /**
   * Get the current game time in milliseconds.
   *
   * Game time starts at 0 when syncWithWallClock() is first called.
   * Subsequent calls return the elapsed time since synchronization.
   *
   * @returns Current game time in milliseconds, or 0 if not yet synchronized
   */
  getGameTime(): number {
    if (!this.isSynchronized) {
      return 0;
    }

    const now = Date.now();
    const elapsedSinceSync = now - this.wallClockSyncTime;
    return this.accumulatedGameTime + elapsedSinceSync;
  }

  /**
   * Synchronize game clock with the wall clock.
   *
   * This establishes the current wall clock time as the reference point for
   * game time calculations. Call this when starting a new game session or
   * resuming after a period where game time was not being tracked.
   *
   * After syncing, getGameTime() will return milliseconds elapsed since
   * this call, plus any previously accumulated game time.
   *
   * @returns Sync result containing current game time and metadata
   */
  syncWithWallClock(): GameTimeSync {
    const now = Date.now();

    if (this.isSynchronized) {
      const currentGameTime = this.getGameTime();
      this.accumulatedGameTime = currentGameTime;
    }

    this.wallClockSyncTime = now;
    this.isSynchronized = true;

    return {
      gameTime: this.accumulatedGameTime,
      drift: 0,
      timestamp: new Date()
    };
  }

  /**
   * Get detailed synchronization information.
   *
   * Useful for debugging and monitoring clock state.
   *
   * @returns Object containing sync metadata
   */
  getSyncInfo(): GameTimeSync {
    const now = Date.now();
    const gameTime = this.getGameTime();

    return {
      gameTime,
      drift: 0,
      timestamp: new Date()
    };
  }

  /**
   * Check if the game clock has been synchronized.
   *
   * @returns true if syncWithWallClock() has been called at least once
   */
  isReady(): boolean {
    return this.isSynchronized;
  }
}