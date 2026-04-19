import { Controller, Post, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { LoggedIn } from '../../../authentication/authentication.guard';
import { PlacePurchaseService, PurchasePlaceDto, PurchasePlaceResult } from './place-purchase.service';

/**
 * Controller for place purchase operations.
 *
 * Provides endpoint for players to purchase places on the map.
 */
@Controller('players')
@UseGuards(LoggedIn)
export class PlacePurchaseController {
  constructor(private readonly placePurchaseService: PlacePurchaseService) {}

  /**
   * Purchase a place for a player.
   *
   * POST /players/:id/purchase-place
   *
   * @param id - Player ID
   * @param purchaseDto - Contains placeId to purchase
   * @returns PurchasePlaceResult indicating success or failure
   */
  @Post(':id/purchase-place')
  @HttpCode(HttpStatus.OK)
  async purchasePlace(
    @Param('id') playerId: string,
    @Body() purchaseDto: PurchasePlaceDto
  ): Promise<PurchasePlaceResult> {
    return this.placePurchaseService.purchasePlace(playerId, purchaseDto.placeId);
  }
}
