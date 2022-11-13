import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VehicleType } from './entities/vehicle-type.entity';
import { AbstractService } from '../../../utils/abstract.service';
import { VehicleTypeMapper } from './vehicle-type.mapper';
import { Mapper } from '../../../utils/mapper';

@Injectable()
export class VehicleTypeService extends AbstractService<VehicleType> {
  constructor(
    @InjectRepository(VehicleType) private readonly repository: Repository<VehicleType>,
    private readonly mapper: VehicleTypeMapper,
  ) {
    super();
  }

  getRepository(): Repository<VehicleType> {
    return this.repository;
  }

  getMapper(): Mapper<any, any> {
    return this.mapper;
  }
}
