import { Repository } from "typeorm";

export class RepositoryAccessor<T> {
  constructor(private readonly repository: Repository<T>, private readonly relationships?: string[]) {}

  getRepository(): Repository<T> {
    return this.repository;
  }

  getRelationships(): string[] {
    return this.relationships;
  }
}