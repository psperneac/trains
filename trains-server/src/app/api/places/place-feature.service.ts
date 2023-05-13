import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PlaceDto } from "../../../models/place.model";
import { Mapper } from "../../../utils/abstract-dto-mapper";
import { AbstractService } from "../../../utils/abstract.service";
import { FeatureService } from "../../../utils/feature.service";
import Place from "./place.entity";
import { PlaceMapper } from "./place.mapper";
import { PlacesService } from "./places.service";

@Injectable()
export class PlaceFeatureService implements FeatureService<Place, PlaceDto> {
  constructor(
    @InjectRepository(Place) private readonly repository: Repository<Place>,
    private readonly service: PlacesService,
    private readonly mapper: PlaceMapper
  ) {}

  getMappedProperties(): string[] {
    return ['id', 'name', 'description', 'type', 'lat', 'long'];
  }

  getMapper(): Mapper<Place, PlaceDto> {
    return this.mapper;
  }

  getRepository(): Repository<Place> {
    return this.repository;
  }

  getService(): AbstractService<Place, PlaceDto> {
    return this.service;
  }

}