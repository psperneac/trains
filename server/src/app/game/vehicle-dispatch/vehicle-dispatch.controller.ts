import { Controller, Get, Injectable, Module, Param, Post, Body, UseFilters, UseGuards } from '@nestjs/common';

import { LoggedIn } from '../../../authentication/authentication.guard';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import { VehicleDispatchService, DispatchVehicleDto, DispatchResult } from './vehicle-dispatch.service';

/**
 * Controller for vehicle dispatch operations.
 *
 * Provides endpoints for:
 * - Dispatching a vehicle with a route
 * - Getting vehicle dispatch status
 * - Cancelling a pending dispatch
 */
@Controller('vehicle-dispatch')
@UseFilters(AllExceptionsFilter)
export class VehicleDispatchController {
  constructor(private readonly vehicleDispatchService: VehicleDispatchService) {}

  /**
   * Dispatch a vehicle along a specified route.
   *
   * POST /vehicles/:id/dispatch
   *
   * @param id - Vehicle instance ID
   * @param dispatchDto - Route information
   * @returns Dispatch result with travel time and scheduled task ID
   */
  @Post(':id/dispatch')
  @UseGuards(LoggedIn)
  async dispatch(
    @Param('id') id: string,
    @Body() dispatchDto: DispatchVehicleDto
  ): Promise<DispatchResult> {
    return this.vehicleDispatchService.dispatch(id, dispatchDto.route);
  }

  /**
   * Get current dispatch status of a vehicle.
   *
   * GET /vehicles/:id/dispatch/status
   *
   * @param id - Vehicle instance ID
   * @returns Current vehicle state including status and route info
   */
  @Get(':id/dispatch/status')
  @UseGuards(LoggedIn)
  async getStatus(@Param('id') id: string) {
    return this.vehicleDispatchService.getVehicleStatus(id);
  }

  /**
   * Cancel a pending vehicle dispatch.
   *
   * POST /vehicles/:id/dispatch/cancel
   *
   * @param id - Vehicle instance ID
   * @returns Success status
   */
  @Post(':id/dispatch/cancel')
  @UseGuards(LoggedIn)
  async cancelDispatch(@Param('id') id: string): Promise<{ success: boolean }> {
    const cancelled = await this.vehicleDispatchService.cancelDispatch(id);
    return { success: cancelled };
  }
}
