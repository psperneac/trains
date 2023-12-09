export class User {
  id: string;
  created: Date;
  modified: Date;
  username: string;
  email: string;
  scope: string;
  authorization: string;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  scope: string;
}

export interface UserPreferenceDto {
  id: string;
  userId: string;
  content: any;
}
