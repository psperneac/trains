import { Expose } from 'class-transformer';
import { CreateDateColumn, DeleteDateColumn, ObjectId, ObjectIdColumn, UpdateDateColumn } from 'typeorm';

export abstract class AbstractEntity {
  @ObjectIdColumn()
  @Expose()
  public _id: ObjectId;

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
