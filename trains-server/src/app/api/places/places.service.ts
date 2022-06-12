import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Place from './place.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreatePlaceDto,
  PlaceDto,
  UpdatePlaceDto,
} from '../../../models/place.model';
import { PlaceMapper } from './place.mapper';
import { PageRequestDto } from '../../../models/pagination.model';
import { PageDto } from '../../../models/page.model';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private repository: Repository<Place>,
    private readonly mapper: PlaceMapper,
  ) {}

  getAll(pagination: PageRequestDto): Promise<PageDto<PlaceDto>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skippedItems = (page - 1) * limit;

    return Promise.all([
      this.repository
        .createQueryBuilder()
        .offset(skippedItems)
        .limit(pagination.limit)
        .getMany(),
      this.repository.count(),
    ]).then(([places, count]) => {
      return {
        data: places.map((place) => this.mapper.toDto(place)),
        page,
        limit,
        totalCount: count,
      };
    });
  }

  getOne(uuid: string): Promise<PlaceDto> {
    return this.repository.findOne(uuid).then((post) => {
      if (post) {
        return this.mapper.toDto(post);
      }
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    });
  }

  create(place: CreatePlaceDto): Promise<PlaceDto> {
    const newPlace = this.repository.create(this.mapper.toDomain(place));
    return this.repository
      .save(newPlace)
      .then((savedPlace) => this.mapper.toDto(savedPlace));
  }

  update(uuid: string, post: UpdatePlaceDto): Promise<PlaceDto> {
    return this.repository
      .update(uuid, this.mapper.toDomain(post))
      .then(() => this.repository.findOne(uuid))
      .then((updatedPlace) => {
        if (updatedPlace) {
          return this.mapper.toDto(updatedPlace);
        }
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      });
  }

  delete(uuid: string): Promise<boolean> {
    return this.repository.delete(uuid).then((deleteResponse) => {
      if (!deleteResponse || !deleteResponse.affected) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }

      return true;
    });
  }
}
