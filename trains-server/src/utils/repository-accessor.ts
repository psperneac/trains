import { Repository } from 'typeorm';

export class RepositoryAccessor<T> {
  constructor(private readonly repository: Repository<T>, private readonly relationships?: string[]) {}

  public getRepository(): Repository<T> {
    return this.repository;
  }

  public getRelationships(): string[] {
    return this.relationships;
  }
}
