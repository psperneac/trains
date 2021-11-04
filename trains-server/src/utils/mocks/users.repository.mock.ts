import User from '../../app/api/users/users.entity';
import { isString } from 'util';
import { cloneDeep } from 'lodash';

export const createMockUser = (
  id: number,
  prefix: string,
  scope?: string,
): User => {
  return {
    id: 'ID' + id,
    username: prefix + id,
    password: prefix + '1!',
    email: prefix + id + '@trains.com',
    version: 0,
    created: new Date(),
    updated: new Date(),
    deleted: null,
    scope: scope || 'USER',
  };
};

export const MOCK_USERS: User[] = [
  createMockUser(1, 'testUser'),
  createMockUser(2, 'testUser'),
  createMockUser(3, 'testUser'),
  createMockUser(10, 'testAdmin', 'ADMIN'),
];

export class MockUsersRepository {
  users = cloneDeep([...MOCK_USERS]);

  reset() {
    this.users = cloneDeep([...MOCK_USERS]);
  }

  find() {
    return this.users;
  }

  findOne(data: string | any) {
    if (isString(data)) {
      return this.users.find((user) => user.id === data);
    }

    let ret = null;
    if (data.email) {
      ret = this.users.find((user) => user.email === data.email);
    } else if (data.id) {
      ret = this.users.find((user) => user.id === data.id);
    }

    return ret;
  }

  create(user: User) {
    if (user.id) {
      return {
        ...user,
        modified: new Date(),
      };
    }

    return {
      ...user,
      id: user.username,
      created: new Date(),
      modified: new Date(),
    };
  }

  update(uuid: string, user: User) {
    user = {
      ...this.users.find((u) => u.id === uuid),
      ...user,
    };

    this.users = [...this.users.filter((u) => u.id !== uuid), user];

    return user;
  }

  save(user: User) {
    this.users = [
      ...this.users.filter((u) => u.username !== user.username),
      user,
    ];
    return user;
  }

  delete(uuid: string) {
    const entity = this.users.find((user) => user.id === uuid);
    this.users = this.users.filter((user) => user.id !== uuid);
    return { affected: !!entity };
  }
}

export const mockedUsersRepository = new MockUsersRepository();
