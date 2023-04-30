import { CreateDateColumn, DeleteDateColumn, Generated, PrimaryColumn, UpdateDateColumn, VersionColumn } from 'typeorm';
import { Expose } from 'class-transformer';

export abstract class AbstractEntity {
  @PrimaryColumn()
  @Generated('uuid')
  @Expose()
  public id: string;

  @VersionColumn({ name: 'version' })
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
