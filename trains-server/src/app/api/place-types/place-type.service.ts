import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AbstractService } from '../../../utils/abstract.service';
import { Mapper } from '../../../utils/mapper';
import { PlaceType } from './entities/place-type.entity';
import { PlaceTypeMapper } from './place-type.mapper';

@Injectable()
export class PlaceTypeService extends AbstractService<PlaceType> {
  constructor(
    @InjectRepository(PlaceType) private readonly repository: Repository<PlaceType>,
    private readonly mapper: PlaceTypeMapper,
  ) {
    super();
  }

  getRepository(): Repository<PlaceType> {
    return this.repository;
  }

  getMapper(): Mapper<any, any> {
    return this.mapper;
  }
}
