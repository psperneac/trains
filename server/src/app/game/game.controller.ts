import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { Admin } from '../../authentication/authentication.guard';
import { JobOfferService } from './job-offer/job-offer.service';

/**
 * Controller for game-level administrative operations.
 *
 * Provides endpoints for:
 * - Force-refreshing all job offers across a game
 */
@Controller('games')
@UseGuards(Admin)
export class GameController {
  constructor(private readonly jobOfferService: JobOfferService) {}

  /**
   * Force refresh all job offers for a game.
   * This triggers a global refresh of all job offers across all places.
   *
   * POST /games/:gameId/refresh-jobs
   *
   * @param gameId - Game ID (not used directly, refreshes all places)
   * @returns Success status
   */
  @Post(':gameId/refresh-jobs')
  async refreshJobs(@Param('gameId') gameId: string): Promise<{ success: boolean }> {
    await this.jobOfferService.refreshAllOffers();
    return { success: true };
  }
}