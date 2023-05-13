import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Mapper } from "../../../utils/abstract-dto-mapper";
import { AbstractService } from "../../../utils/abstract.service";
import { FeatureService } from "../../../utils/feature.service";
import { VehicleTypeDto } from "./dto/vehicle-type.dto";
import { VehicleType } from "./entities/vehicle-type.entity";
import { VehicleTypeMapper } from "./vehicle-type.mapper";
import { VehicleTypeService } from "./vehicle-type.service";

@Injectable()
export class VehicleTypeFeatureService implements FeatureService<VehicleType, VehicleTypeDto> {
  constructor(
    @InjectRepository(VehicleType) private readonly repository: Repository<VehicleType>,
    private readonly service: VehicleTypeService,
    private readonly mapper: VehicleTypeMapper) {
  }

  getRepository(): Repository<VehicleType> {
    return this.repository;
  }

  public getService(): AbstractService<VehicleType, VehicleTypeDto> {
    return this.service;
  }

  public getMapper(): Mapper<VehicleType, VehicleTypeDto> {
    return this.mapper;
  }

  public getMappedProperties(): string[] {
    return ['id', 'type', 'name', 'description', 'content'];
  }
}
