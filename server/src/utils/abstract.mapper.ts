/**
 * Abstract base class for DTO mappers.
 *
 * Defines the contract for bidirectional mapping between domain entities and DTOs.
 * Concrete implementations must provide toDto and toDomain methods.
 *
 * T - Domain entity type
 * R - DTO type
 */
export abstract class AbstractMapper<T, R> {
  /**
   * Convert a domain entity to a DTO.
   *
   * @param domain - The domain entity to convert
   * @returns The DTO representation
   */
  public abstract toDto(domain: T): R;

  /**
   * Convert a DTO to a domain entity.
   *
   * If an existing domain entity is provided, the DTO properties should be
   * merged onto it (for partial updates). If not provided, a new domain
   * entity should be created from the DTO.
   *
   * @param dto - The DTO to convert
   * @param domain - Optional existing domain entity to merge onto
   * @returns The domain entity
   */
  public abstract toDomain(dto: R, domain?: T): T;
}
