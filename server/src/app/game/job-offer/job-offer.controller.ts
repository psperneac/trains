import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { LoggedIn } from '../../../authentication/authentication.guard';
import { JobOfferService, GameJobOffer } from './job-offer.service';

/**
 * Controller for job offer operations.
 *
 * Provides endpoints for:
 * - Getting job offers at a specific place
 * - Getting all job offers for a player
 * - Manually triggering job offer refresh for a place
 */
@Controller('place-instances')
@UseGuards(LoggedIn)
export class JobOfferController {
  constructor(private readonly jobOfferService: JobOfferService) {}

  /**
   * Get job offers at a specific owned place.
   *
   * GET /place-instances/:id/jobs
   *
   * @param id - Place instance ID
   * @returns Array of job offers available at this place
   */
  @Get(':id/jobs')
  async getJobs(@Param('id') placeInstanceId: string): Promise<GameJobOffer[]> {
    return this.jobOfferService.getOffersForPlace(placeInstanceId);
  }

  /**
   * Manually trigger job offer generation for a place.
   * This is useful for testing or manual refresh scenarios.
   *
   * POST /place-instances/:id/refresh-jobs
   *
   * @param id - Place instance ID
   * @returns Array of newly generated job offers
   */
  @Post(':id/refresh-jobs')
  async refreshJobs(@Param('id') placeInstanceId: string): Promise<GameJobOffer[]> {
    return this.jobOfferService.generateOffersForPlace(placeInstanceId);
  }
}
