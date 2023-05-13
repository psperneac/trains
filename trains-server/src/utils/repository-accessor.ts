import { Repository } from "typeorm";

export class RepositoryAccessor<T> {
  constructor(private repository: Repository<T>) {}

  getRepository(): Repository<T> {
    return this.repository;
  }
}