import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VehicleTypeDto } from './dto/vehicle-type.dto';
import { VehicleType } from './entities/vehicle-type.entity';
import { PageRequestDto } from '../../../models/pagination.model';
import { PageDto } from '../../../models/page.model';
import { AbstractService } from '../../../utils/abstract.service';
import { VehicleTypeMapper } from './vehicle-type.mapper';
import { Mapper } from '../../../utils/mapper';

@Injectable()
export class VehicleTypeService extends AbstractService {
  constructor(
    @InjectRepository(VehicleType) private readonly repository: Repository<VehicleType>,
    private readonly mapper: VehicleTypeMapper,
  ) {
    super();
  }

  findAll(pagination: PageRequestDto): Promise<PageDto<VehicleType>> {
    return super.findAll(pagination);
  }

  findOne(uuid: string) {
    return super.findOne(uuid);
  }

  create(createVehicleTypeDto: VehicleTypeDto) {
    return super.create(createVehicleTypeDto);
  }

  update(uuid: string, updateVehicleTypeDto: VehicleTypeDto) {
    return super.update(uuid, updateVehicleTypeDto);
  }

  delete(uuid: string) {
    return super.delete(uuid);
  }

  getRepository(): Repository<VehicleType> {
    return this.repository;
  }

  getMapper(): Mapper<any, any> {
    return this.mapper;
  }
}
