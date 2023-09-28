export abstract class AbstractMapper<T, R> {
  public abstract toDto(domain: T): R;

  public abstract toDomain(dto: R, domain?: T): T;
}
