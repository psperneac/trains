import { Injectable, Module } from "@nestjs/common";
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AbstractDtoMapper, Mapper } from "../../../utils/abstract-dto-mapper";
import { AbstractServiceController } from "../../../utils/abstract-service.controller";
import { AbstractService } from "../../../utils/abstract.service";
import { FeatureService } from "../../../utils/feature.service";
import { Vehicle, VehicleDto } from "./vehicle.entity";

export const VEHICLE_SERVICE = Symbol('VEHICLE_SERVICE');
export const VEHICLE_CONTROLLER = Symbol('VEHICLE_CONTROLLER');
export const VEHICLE_REPOSITORY = Symbol('VEHICLE_REPOSITORY');
export const VEHICLE_MAPPER = Symbol('VEHICLE_MAPPER');

@Injectable()
export class VehicleService extends AbstractService<Vehicle, VehicleDto> {
  constructor(private feature: VehicleFeatureService) {
    super(feature);
  }
}

@Injectable()
export class VehicleController extends AbstractServiceController<Vehicle, VehicleDto> {
  constructor(private feature: VehicleFeatureService) {
    super(feature);
  }
}

@Injectable()
export class VehicleMapper extends AbstractDtoMapper<Vehicle, VehicleDto> {
  constructor(private feature: VehicleFeatureService) {
    super(feature);
  }
}

@Injectable()
export class VehicleFeatureService implements FeatureService<Vehicle, VehicleDto> {

  constructor(
    @InjectRepository(Vehicle) private readonly repository: Repository<Vehicle>,
    private readonly service: VehicleService,
    private readonly mapper: VehicleMapper) {
  }

  public getRepository(): Repository<Vehicle> {
    return this.repository;
  }

  public getService(): AbstractService<Vehicle, VehicleDto> {
    return this.service;
  }

  public getMappedProperties(): string[] {
    return [
      'id', 'type', 'name', 'description', 'content',
      'engineMax', 'engineLoad', 'engineFuel',
      'auxMax', 'auxLoad', 'auxFuel',
      'speed'
    ];

  }

  public getMapper(): Mapper<Vehicle, VehicleDto> {
    return this.mapper;
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle])],
  controllers: [VehicleController],
  providers: [VehicleMapper, VehicleService, VehicleFeatureService
  ],
  exports: [VehicleMapper, VehicleService, VehicleFeatureService]
})
export class VehicleModule {}

