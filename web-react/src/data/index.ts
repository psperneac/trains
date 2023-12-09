export * from './vehicle-type.model';
export * from './place-type.model';

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
