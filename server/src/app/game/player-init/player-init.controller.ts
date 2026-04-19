import { Body, Controller, Get, Injectable, Module, Param, Post, UseFilters, UseGuards } from '@nestjs/common';

import { LoggedIn } from '../../../authentication/authentication.guard';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { PlayerInitService, SelectStartingPlaceDto, SelectStartingPlaceResult } from './player-init.service';

/**
 * Controller for player initialization operations.
 *
 * Provides endpoints for:
 * - Selecting a starting place when joining a game
 * - Getting available starting places for a player's game
 */
@Controller('player-init')
@UseFilters(AllExceptionsFilter)
export class PlayerInitController {
  constructor(private readonly playerInitService: PlayerInitService) {}

  /**
   * Select a starting place for a player.
   *
   * POST /players/:id/select-starting-place
   *
   * @param id - Player ID
   * @param selectDto - Contains placeId to select
   * @returns Result with created PlaceInstance and VehicleInstance
   */
  @Post(':id/select-starting-place')
  @UseGuards(LoggedIn)
  async selectStartingPlace(
    @Param('id') id: string,
    @Body() selectDto: SelectStartingPlaceDto
  ): Promise<SelectStartingPlaceResult> {
    return this.playerInitService.selectStartingPlace(id, selectDto.placeId);
  }
}

@Module({
  controllers: [PlayerInitController],
  providers: [PlayerInitService],
  exports: [PlayerInitService]
})
export class PlayerInitModule {}
