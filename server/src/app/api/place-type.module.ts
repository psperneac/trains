import { Controller, Get, Injectable, Module, UseFilters } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

import { AbstractMongoEntity } from '../../utils/abstract-mongo.entity';
import { AbstractMongoService } from '../../utils/abstract-mongo.service';
import { AbstractMongoServiceController } from '../../utils/abstract-mongo-service.controller';
import { AbstractMongoDtoMapper } from '../../utils/abstract-dto-mapper';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';

export class PlaceTypeDto {
  id: string;
  type: string;
  name: string;
  description: string;
  content: any;
}

export const PLACE_TYPE_DATA: PlaceTypeDto[] = [
  { id: '682be65aeffcff2be10510de', type: 'RAIL', name: 'Railway station', description: 'Railway station', content: {} },
  { id: '682be65aeffcff2be10510df', type: 'WAREHOUSE', name: 'Warehouse', description: 'Warehouse', content: {} },
  { id: '682be65aeffcff2be10510e0', type: 'PORT', name: 'Port', description: 'Port', content: {} },
  { id: '682be65aeffcff2be10510e1', type: 'BUSINESS', name: 'Business', description: 'A business place', content: {} },
  { id: '682be65aeffcff2be10510e2', type: 'TRANSIT', name: 'Transit Station', description: 'Mass Transit Station', content: {} },
  { id: '682be65aeffcff2be10510e3', type: 'YARD', name: 'Yard', description: 'Vehicle, Train, Mass Transit or Shipyard', content: {} },
  { id: '683bd04be7cc7a6c65087ab0', type: 'RESIDENCE', name: 'Residence', description: 'A private residence', content: {} },
  { id: '683bd04be7cc7a6c65087ab1', type: 'AIRPORT', name: 'Airport', description: 'An airport where planes take off and land', content: {} }
];

@Schema({ collection: 'place_types' })
export class PlaceType extends AbstractMongoEntity {
  @Prop({ required: true, type: String })
  type: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ type: Object })
  content: any;
}

export const PlaceTypeSchema = SchemaFactory.createForClass(PlaceType);

@Injectable()
export class PlaceTypeService {
  findAllPlaceTypes(): Promise<PlaceTypeDto[]> {
    return Promise.resolve(PLACE_TYPE_DATA);
  }
}

@Injectable()
export class PlaceTypeMapper {
  toDto(placeType: any): PlaceTypeDto {
    return {
      id: placeType._id?.toString(),
      type: placeType.type,
      name: placeType.name,
      description: placeType.description,
      content: placeType.content,
    };
  }
}

@Controller('place-types')
@UseFilters(AllExceptionsFilter)
export class PlaceTypeController {
  constructor(private readonly service: PlaceTypeService) {}

  @Get()
  async getAllPlaceTypes() {
    const data = await this.service.findAllPlaceTypes();
    return { data, page: 1, limit: 0, totalCount: data.length };
  }
}

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PlaceType.name, schema: PlaceTypeSchema }])
  ],
  controllers: [PlaceTypeController],
  providers: [PlaceTypeService, PlaceTypeMapper],
  exports: [PlaceTypeService, PlaceTypeMapper]
})
export class PlaceTypeModule {}
