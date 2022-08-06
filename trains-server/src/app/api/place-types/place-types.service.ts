import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractService } from '../../../utils/abstract.service';
import { Mapper } from '../../../utils/mapper';
import { PlaceType } from './entities/place-type.entity';
import { PlaceTypeMapper } from './place-type.mapper';
import { PageRequestDto } from '../../../models/pagination.model';
import { PageDto } from '../../../models/page.model';
import { PlaceTypeDto } from './dto/place-type.dto';

@Injectable()
export class PlaceTypesService extends AbstractService {
  constructor(
    @InjectRepository(PlaceType) private readonly repository: Repository<PlaceType>,
    private readonly mapper: PlaceTypeMapper,
  ) {
    super();
  }

  findAll(pagination: PageRequestDto): Promise<PageDto<PlaceType>> {
    return super.findAll(pagination);
  }

  findOne(uuid: string) {
    return super.findOne(uuid);
  }

  create(createVehicleTypeDto: PlaceTypeDto) {
    return super.create(createVehicleTypeDto);
  }

  update(uuid: string, updateVehicleTypeDto: PlaceTypeDto) {
    return super.update(uuid, updateVehicleTypeDto);
  }

  delete(uuid: string) {
    return super.delete(uuid);
  }

  getRepository(): Repository<PlaceType> {
    return this.repository;
  }

  getMapper(): Mapper<any, any> {
    return this.mapper;
  }
}
