import { cloneDeep } from 'lodash';
import { UpdateResult } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { AbstractEntity } from '../abstract.entity';

export class MockRepository<T extends AbstractEntity> {
  private data: T[];
  private dataOffset = 0;
  private dataLimit: number;

  constructor(private initialData: T[]) {
    this.reset();
  }

  internalGetData() {
    return this.data;
  }

  internalFind(id) {
    return this.data.find(d => d._id.toString() === id);
  }

  reset() {
    this.data = cloneDeep([...this.initialData]);
    this.dataLimit = this.data.length;
  }

  getMany() {
    const ret = this.data.slice(
      this.dataOffset,
      Math.min(this.dataOffset + (this.dataLimit || this.data.length), this.data.length)
    );
    return Promise.resolve(ret);
  }

  find() {
    return Promise.resolve(this.data);
  }

  findOne(param: string | any) {
    if (typeof param === 'string') {
      return Promise.resolve(this.data.find(d => d._id.toString() === param));
    }

    let ret = null;
    if (param['email']) {
      ret = this.data.find(d => d['email'] === param['email']);
    } else if (param.id) {
      ret = this.data.find(d => d._id.toString() === param.id);
    }

    return Promise.resolve(ret);
  }

  create(entity: T) {
    if (entity._id) {
      return {
        ...entity,
        modified: new Date()
      };
    }

    return {
      ...entity,
      id: uuidv4(),
      created: new Date(),
      modified: new Date()
    };
  }

  update(id: string, entity: T): Promise<UpdateResult> {
    const existing = this.data.find(u => u._id.toString() === id);

    // TODO: return error if it doesn't exist

    entity = {
      ...existing,
      ...entity,
      version: existing.version + 1,
      updated: new Date()
    };

    this.data = [...this.data.filter(u => u._id.toString() !== id), entity];

    return Promise.resolve({
      raw: 0,
      affected: 1
    } as UpdateResult);
  }

  save(entity: T) {
    this.data = [...this.data.filter(u => u._id.toString() !== entity._id.toString()), entity];
    return Promise.resolve(entity);
  }

  delete(id: string) {
    const entity = this.data.find(u => u._id.toString() === id);
    this.data = this.data.filter(u => u._id.toString() !== id);
    return Promise.resolve({ affected: !!entity });
  }

  count() {
    return this.data.length;
  }

  createQueryBuilder() {
    return this;
  }

  offset(skippedItems: number) {
    this.dataOffset = skippedItems;
    return this;
  }

  limit(limit: number) {
    this.dataLimit = limit;
    return this;
  }
}
