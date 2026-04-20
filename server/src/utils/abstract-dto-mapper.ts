import { cloneDeep, pick } from 'lodash';

import { AbstractEntity } from './abstract.entity';
import { AbstractMongoEntity } from './abstract-mongo.entity';

/**
 * Base interface for DTO mappers.
 *
 * Mappers convert between domain entities and DTOs.
 * - toDto: domain entity -> DTO (for API responses)
 * - toDomain: DTO -> domain entity (for API requests)
 *
 * T - domain entity type
 * R - DTO type
 */
export interface Mapper<T, R> {
  toDto: (domain: T) => Promise<R>;
  toDomain: (dto: R, domain?: T | Partial<T>) => Promise<T>;
}

/**
 * Base mapper implementation for TypeORM entities.
 *
 * Provides default behavior using lodash pick/assign for property mapping.
 * Override getMappedProperties() to control which fields are included.
 *
 * T - entity type extending AbstractEntity
 * R - DTO type
 */
export class AbstractDtoMapper<T extends AbstractEntity, R> implements Mapper<T, R> {
  /**
   * Convert DTO to domain entity.
   *
   * If domain is provided, merges DTO properties onto it (preserving existing fields).
   * If domain is not provided, casts DTO directly to entity type.
   *
   * @param dto - Source DTO
   * @param domain - Optional existing entity to merge onto
   * @returns Domain entity
   */
  async toDomain(dto: R, domain?: T | Partial<T>): Promise<T> {
    if (!domain) {
      return dto as unknown as T;
    }
    // Clone to avoid mutating the original dto
    Object.assign(domain, cloneDeep(dto));
    return domain as T;
  }

  /**
   * Convert domain entity to DTO.
   *
   * If getMappedProperties() returns an array, only those properties are included.
   * Otherwise, all properties are cloned.
   *
   * @param domain - Source domain entity
   * @returns DTO, or null if domain is null/undefined
   */
  async toDto(domain: T): Promise<R> {
    if (!domain) {
      return null;
    }

    const prop = this.getMappedProperties();
    if (!prop || prop.length === 0) {
      // No property filtering - return all fields
      return cloneDeep(domain) as any as R;
    }

    // Pick only mapped properties
    return pick(cloneDeep(domain), this.getMappedProperties()) as any as R;
  }

  /**
   * Override this method to restrict which properties are included in DTO.
   *
   * @returns Array of property names to include, or empty array for all properties
   */
  getMappedProperties() {
    return [];
  }
}

/**
 * Base mapper implementation for MongoDB entities.
 *
 * Same behavior as AbstractDtoMapper but typed for AbstractMongoEntity.
 *
 * T - entity type extending AbstractMongoEntity
 * R - DTO type
 */
export class AbstractMongoDtoMapper<T extends AbstractMongoEntity, R> implements Mapper<T, R> {
  /**
   * Convert DTO to MongoDB domain entity.
   *
   * If domain is provided, merges DTO properties onto it.
   * Clones to avoid mutation.
   *
   * @param dto - Source DTO
   * @param domain - Optional existing entity to merge onto
   * @returns Domain entity
   */
  async toDomain(dto: R, domain?: T | Partial<T>): Promise<T> {
    if (!domain) {
      return dto as unknown as T;
    }
    Object.assign(domain, cloneDeep(dto));
    return domain as T;
  }

  /**
   * Convert MongoDB domain entity to DTO.
   *
   * @param domain - Source domain entity
   * @returns DTO, or null if domain is null/undefined
   */
  async toDto(domain: T): Promise<R> {
    if (!domain) {
      return null;
    }

    const prop = this.getMappedProperties();
    if (!prop || prop.length === 0) {
      return cloneDeep(domain) as any as R;
    }

    return pick(cloneDeep(domain), this.getMappedProperties()) as any as R;
  }

  /**
   * Override this method to restrict which properties are included in DTO.
   *
   * @returns Array of property names to include, or empty array for all properties
   */
  getMappedProperties() {
    return [];
  }
}
