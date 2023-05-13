import { Repository } from "typeorm";
import { Mapper } from "./abstract-dto-mapper";
import { AbstractEntity } from "./abstract.entity";
import { AbstractService } from "./abstract.service";

export interface FeatureService<T extends AbstractEntity,R> {
  getRepository(): Repository<T>;
  getService(): AbstractService<T, R>;
  getMapper(): Mapper<T,R>;
  getMappedProperties(): string[];
}
