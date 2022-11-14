import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleType } from '../app/api/vehicle-types/entities/vehicle-type.entity';

const vehicleTypes = [
  {
    type: 'ROAD',
    name: 'Road Vehicle',
    defaultName: 'Road Vehicle',
    description: 'a vehicle driving on roads',
    content: JSON.stringify({})
  },
  {
    type: 'RAIL',
    name: 'Rail Stock',
    defaultName: 'Rail Stock',
    description: 'cars and locomotives',
    content: JSON.stringify({})
  },
  {
    type: 'SHIP',
    name: 'Ships',
    defaultName: 'Ships',
    description: 'ships and boats',
    content: JSON.stringify({})
  }
]

@Injectable()
export class VehicleTypeSeederService {
  constructor(
    @InjectRepository(VehicleType) private readonly repository: Repository<VehicleType>
  ) {
  }

  create(): Array<Promise<VehicleType>> {
    return vehicleTypes.map((vehicleType) => {
      return this.repository
        .findOne({ type: vehicleType.type })
        .then(async foundVehicleType => {
          // We check if a language already exists.
          // If it does don't create a new one.
          if (foundVehicleType) {
            return Promise.resolve(null);
          }
          
          return Promise.resolve(
            // or create(language).then(() => { ... });
            await this.repository.save(vehicleType),
          );
        })
        .catch(error => Promise.reject(error));
    });
  }
}
