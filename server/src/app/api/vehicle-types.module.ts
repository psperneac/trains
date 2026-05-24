import { Controller, Get, Injectable, Module, UseFilters } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

import { AbstractMongoEntity } from '../../utils/abstract-mongo.entity';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';

export class VehicleTypeDto {
  id: string;
  type: string;
  name: string;
  description: string;
  content: any;
}

/*

682be65aeffcff2be10510d9
682be65aeffcff2be10510da
682be65aeffcff2be10510db
682be65aeffcff2be10510dc
682be65aeffcff2be10510dd

*/
const VEHICLE_TYPE_DATA: VehicleTypeDto[] = [
  { id: '682be65aeffcff2be10510d3', type: 'TRUCK', name: 'Truck', description: 'Carries freight by road', content: {} },
  { id: '682be65aeffcff2be10510d4', type: 'SHIP', name: 'Ship', description: 'Goes on water, carries a lot', content: {} },
  { id: '682be65aeffcff2be10510d5', type: 'TRAIN', name: 'Train', description: 'A vehicle that runs on tracks', content: {} },
  { id: '682be65aeffcff2be10510d6', type: 'CAR', name: 'Car', description: 'Small road vehicle', content: {} },
  { id: '682be65aeffcff2be10510d7', type: 'BUS', name: 'Bus', description: 'Mass transit vehicle', content: {} },
  { id: '682be65aeffcff2be10510d8', type: 'PLANE', name: 'Plane', description: 'Flies in the air', content: {} },
  { id: '682be65aeffcff2be10510d9', type: 'LOCOMOTIVE', name: 'Locomotive', description: 'Rail vehicle for hauling cargo', content: {} },
  { id: '682be65aeffcff2be10510da', type: 'FREIGHT_CAR', name: 'Freight Car', description: 'Rail cargo car for carrying goods', content: {} },
  { id: '682be65aeffcff2be10510db', type: 'TENDER', name: 'Tender', description: 'Coal and water car for steam locomotives', content: {} },
  { id: '682be65aeffcff2be10510dc', type: 'CARGO_TRUCK', name: 'Cargo Truck', description: 'Road vehicle for transporting goods', content: {} },
  { id: '682be65aeffcff2be10510dd', type: 'CARGO_SHIP', name: 'Cargo Ship', description: 'Water vessel for transporting goods', content: {} }
];

@Schema({ collection: 'vehicle_types' })
export class VehicleType extends AbstractMongoEntity {
  @Prop({ required: true, type: String })
  type: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ type: Object })
  content: any;
}

export const VehicleTypeSchema = SchemaFactory.createForClass(VehicleType);

@Injectable()
export class VehicleTypeService {
  constructor() {
  }

  findAllVehicleTypes(): Promise<VehicleTypeDto[]> {
    return Promise.resolve(VEHICLE_TYPE_DATA);
  }
}

@Injectable()
export class VehicleTypeMapper {
  toDto(vehicleType: any): VehicleTypeDto {
    return {
      id: vehicleType._id?.toString(),
      type: vehicleType.type,
      name: vehicleType.name,
      description: vehicleType.description,
      content: vehicleType.content,
    };
  }
}

@Controller('vehicle-types')
@UseFilters(AllExceptionsFilter)
export class VehicleTypeController {
  constructor(private readonly service: VehicleTypeService) {}

  @Get()
  getAllVehicleTypes() {
    return this.service.findAllVehicleTypes();
  }
}

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VehicleType.name, schema: VehicleTypeSchema }])
  ],
  controllers: [VehicleTypeController],
  providers: [VehicleTypeService, VehicleTypeMapper],
  exports: [VehicleTypeService, VehicleTypeMapper]
})
export class VehicleTypesModule {}
