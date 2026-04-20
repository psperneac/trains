import { Types } from 'mongoose';

/**
 * Base entity class for MongoDB documents.
 *
 * IMPORTANT: Do NOT use @Prop() decorators on these fields.
 * Mongoose automatically manages _id, __v, created, updated, and deleted fields.
 * Adding @Prop() decorators can cause conflicts with Mongoose's internal handling.
 *
 * The service layer converts Mongoose documents to plain objects via toObject()
 * before returning, which strips internal Mongoose properties ($__, $isNew, etc.)
 */
export abstract class AbstractMongoEntity {
  /** Mongoose document ID - managed automatically by Mongoose */
  _id: Types.ObjectId;

  /** Mongoose version key - managed automatically by Mongoose */
  __v: number;

  /** Document creation timestamp - set by service layer */
  created: Date;

  /** Document last update timestamp - set by service layer */
  updated: Date;

  /** Soft delete timestamp - set when document is deleted (nullable) */
  deleted: Date;
}
