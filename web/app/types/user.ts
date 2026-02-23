export interface AdminUserDto {
  id: string;
  username: string;
  email: string;
  scope: string;
  preferences: any;
  created: string;
  updated: string;
  players?: any[];
}

export interface PageDto<T> {
  data: T[];
  page: number;
  limit: number;
  totalCount: number;
}
