import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export abstract class AbstractMongoEntity {
  @Prop()
  _id: Types.ObjectId;

  @Prop()
  __v: number;

  @Prop()
  created: Date;

  @Prop()
  updated: Date;

  @Prop()
  deleted: Date;
}

export type AbstractMongoDocument = Document & AbstractMongoEntity;
