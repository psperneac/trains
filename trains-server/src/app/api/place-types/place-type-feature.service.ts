import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Mapper } from "../../../utils/abstract-dto-mapper";
import { AbstractService } from "../../../utils/abstract.service";
import { FeatureService } from "../../../utils/feature.service";
import { PlaceTypeDto } from "./dto/place-type.dto";
import { PlaceType } from "./entities/place-type.entity";
import { PlaceTypeMapper } from "./place-type.mapper";
import { PlaceTypeService } from "./place-type.service";

@Injectable()
export class PlaceTypeFeatureService implements FeatureService<PlaceType, PlaceTypeDto> {
  constructor(
    @InjectRepository(PlaceType) private readonly repository: Repository<PlaceType>,
    private readonly service: PlaceTypeService,
    private readonly mapper: PlaceTypeMapper
  ) {}

  getMappedProperties(): string[] {
    return ['id', 'type', 'name', 'description', 'content'];
  }

  getMapper(): Mapper<PlaceType, PlaceTypeDto> {
    return this.mapper;
  }

  getRepository(): Repository<PlaceType> {
    return this.repository;
  }

  getService(): AbstractService<PlaceType, PlaceTypeDto> {
    return this.service;
  }

}