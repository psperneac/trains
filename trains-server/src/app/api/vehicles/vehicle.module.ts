import { Injectable, Module, OnModuleInit } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AbstractDtoMapper, Mapper } from "../../../utils/abstract-dto-mapper";
import { AbstractServiceController } from "../../../utils/abstract-service.controller";
import { AbstractService } from "../../../utils/abstract.service";
import { FeatureService } from "../../../utils/feature.service";
import { Vehicle, VehicleDto } from "./vehicle.entity";
import { ModuleTokens } from '../../../utils/module-tokens';
import { ModuleRef } from '@nestjs/core';

export const TOKENS = new ModuleTokens('VEHICLE');

@Injectable()
export class VehicleRepository {
  constructor(
    @InjectRepository(Vehicle) private readonly repository: Repository<Vehicle>
  ) {}

  getRepository(): Repository<Vehicle> { return this.repository; }
}

@Injectable()
export class VehicleService extends AbstractService<Vehicle, VehicleDto> implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {
    super(moduleRef, TOKENS);
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
  providers: [VehicleMapper, VehicleService, VehicleFeatureService,
    {
      provide: TOKENS.repository,
      inject: [VehicleRepository],
      useFactory: (repositoryHolder) => repositoryHolder.getRepository()
    },
    {
      provide: TOKENS.mappedProperties,
      useValue: [
        'id', 'type', 'name', 'description', 'content',
        'engineMax', 'engineLoad', 'engineFuel',
        'auxMax', 'auxLoad', 'auxFuel',
        'speed'
      ]
    }
  ],
  exports: [VehicleMapper, VehicleService, VehicleFeatureService]
})
export class VehicleModule {}

