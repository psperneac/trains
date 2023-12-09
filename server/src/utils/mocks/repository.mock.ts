import { AbstractEntity } from '../abstract.entity';
import { cloneDeep } from 'lodash';
import * as uuid from 'uuid-v4';
import { UpdateResult } from 'typeorm';

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
    return this.data.find(d => d.id === id);
  }

  reset() {
    this.data = cloneDeep([...this.initialData]);
    this.dataLimit = this.data.length;
  }

  getMany() {
    const ret = this.data.slice(this.dataOffset, Math.min(this.dataOffset + (this.dataLimit || this.data.length), this.data.length));
    return Promise.resolve(ret);
  }

  find() {
    return Promise.resolve(this.data);
  }

  findOne(param: string | any) {
    if (typeof param === 'string') {
      return Promise.resolve(this.data.find(d => d.id === param));
    }

    let ret = null;
    if (param['email']) {
      ret = this.data.find(d => d['email'] === param['email']);
    } else if (param.id) {
      ret = this.data.find(d => d.id === param.id);
    }

    return Promise.resolve(ret);
  }

  create(entity: T) {
    if (entity.id) {
      return {
        ...entity,
        modified: new Date()
      };
    }

    return {
      ...entity,
      id: uuid(),
      created: new Date(),
      modified: new Date()
    };
  }

  update(id: string, entity: T): Promise<UpdateResult> {
    const existing = this.data.find(u => u.id === id);

    // TODO: return error if it doesn't exist

    entity = {
      ...existing,
      ...entity,
      version: existing.version + 1,
      updated: new Date()
    };

    this.data = [...this.data.filter(u => u.id !== id), entity];

    return Promise.resolve({
      raw: 0,
      affected: 1
    } as UpdateResult);
  }

  save(entity: T) {
    this.data = [...this.data.filter(u => u.id !== entity.id), entity];
    return Promise.resolve(entity);
  }

  delete(id: string) {
    const entity = this.data.find(u => u.id === id);
    this.data = this.data.filter(u => u.id !== id);
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
