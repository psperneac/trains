import { assign, cloneDeep, pick } from 'lodash';
import { AbstractEntity } from "./abstract.entity";
import { FeatureService } from "./feature.service";

/**
 * Base interface for a mapper. Implement either of the 2 methods to restrict
 * some of the fields mapped or to convert the data.
 *
 * T - entity type
 * R - entity dto type
 */
export interface Mapper<T, R> {
  toDto: (domain: T) => R;
  toDomain: (dto: R, domain?: T | Partial<T>) => T;
}

/**
 * Base implementation for a mapper.
 *
 * T - entity type
 * R - entity dto type
 */
export class AbstractDtoMapper<T extends AbstractEntity,R> implements Mapper<T,R> {
  constructor(private readonly featureService: FeatureService<T, R>) {}

  toDomain(dto: R, domain?: T | Partial<T>): T {
    const ret = {
      ...domain,
    };

    assign(ret, {
      ...dto
    });

    return ret as T;
  }

  toDto(domain: T): R {
    if (!domain) {
      return null;
    }

    return pick(cloneDeep(domain), this.featureService.getMappedProperties());
  }
}
