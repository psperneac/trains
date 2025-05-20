import { Injectable, Module } from '@nestjs/common';
import { InjectModel, MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AbstractMongoEntity, AbstractMongoDocument } from '../../../utils/abstract-mongo.entity';

@Schema()
export class MapTemplate extends AbstractMongoEntity {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ type: Object })
  content: any;
}

export type MapTemplateDocument = MapTemplate & AbstractMongoDocument;
export const MapTemplateSchema = SchemaFactory.createForClass(MapTemplate);

export interface MapTemplateDto {
  id: string;
  name: string;
  description: string;
  content: any;
}

@Injectable()
export class MapTemplateMapper {
  async toDto(domain: MapTemplate): Promise<MapTemplateDto> {
    if (!domain) {
      return null;
    }

    return {
      id: domain._id.toString(),
      name: domain.name,
      description: domain.description,
      content: domain.content
    };
  }

  async toDomain(dto: MapTemplateDto): Promise<MapTemplate> {
    if (!dto) {
      return null;
    }

    return {
      _id: dto.id ? new Types.ObjectId(dto.id) : new Types.ObjectId(),
      __v: 0,
      created: new Date(),
      updated: new Date(),
      deleted: null,
      name: dto.name,
      description: dto.description,
      content: dto.content
    };
  }
}

@Injectable()
export class MapTemplateService {
  constructor(
    @InjectModel(MapTemplate.name) private model: Model<MapTemplateDocument>,
    private readonly mapper: MapTemplateMapper
  ) {}

  async findAll(): Promise<MapTemplate[]> {
    return this.model.find().exec();
  }

  async findOne(id: string): Promise<MapTemplate> {
    return this.model.findById(id).exec();
  }

  async create(template: MapTemplate): Promise<MapTemplate> {
    const createdTemplate = new this.model(template);
    return createdTemplate.save();
  }

  async update(id: string, template: MapTemplate): Promise<MapTemplate> {
    return this.model.findByIdAndUpdate(id, template, { new: true }).exec();
  }

  async delete(id: string): Promise<MapTemplate> {
    return this.model.findByIdAndDelete(id).exec();
  }
}

@Module({
  imports: [MongooseModule.forFeature([{ name: MapTemplate.name, schema: MapTemplateSchema }])],
  providers: [MapTemplateService, MapTemplateMapper],
  exports: [MapTemplateService, MapTemplateMapper]
})
export class MapTemplateModule {}
