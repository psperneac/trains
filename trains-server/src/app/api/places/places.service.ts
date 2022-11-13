import { Injectable } from '@nestjs/common';
import Place from './place.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from '../../../utils/abstract.service';

@Injectable()
export class PlacesService extends AbstractService<Place> {
  constructor(
    @InjectRepository(Place)
    private repository: Repository<Place>
  ) {
    super();
  }

  public getRepository(): Repository<Place> {
    return this.repository;
  }
}
