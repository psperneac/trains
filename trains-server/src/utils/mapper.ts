export interface Mapper<T, R> {
  toDto: (domain: T) => R;
  toDomain: (dto: R, domain?: T | Partial<T>) => T;
}
