export interface User {
  id: string;
  created: Date;
  modified: Date;
  username: string;
  email: string;
  scope: string;
  authorization: string;
}
