import { Expose } from 'class-transformer';
import { CreateDateColumn, DeleteDateColumn, ObjectId, ObjectIdColumn, UpdateDateColumn, VersionColumn } from 'typeorm';

export abstract class AbstractEntity {
  @ObjectIdColumn()
  @Expose()
  public _id: ObjectId;

  @VersionColumn({ name: '__v' })
  @Expose()
  public version: number;

  @CreateDateColumn({ name: 'created' })
  @Expose()
  public created: Date;

  @UpdateDateColumn({ name: 'updated' })
  @Expose()
  public updated: Date;

  @DeleteDateColumn({ name: 'deleted' })
  @Expose()
  public deleted: Date;
}
