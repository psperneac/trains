import { Injectable, Logger } from '@nestjs/common';
import { VehicleTypeSeederService } from './vehicle-type-seeder.service';

@Injectable()
export class Seeder {
  constructor(
    private readonly logger: Logger,
    private readonly vehicleTypeSeederService: VehicleTypeSeederService
  ) {
  }

  async seed() {
    await this.vehicleTypes();
  }

  async vehicleTypes() {
    return await Promise.all(this.vehicleTypeSeederService.create())
      .then(createdVehicleTypes => {
        this.logger.debug(`Successfully completed seeding ${createdVehicleTypes.length} vehicle types`);
        return Promise.resolve(createdVehicleTypes);
      })
      .catch(error => {
        this.logger.error('Failed seeding vehicle types', error);

        Promise.reject(error);
      });
  }
}