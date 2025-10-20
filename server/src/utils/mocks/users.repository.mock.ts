import { isString } from 'util';

import * as bcrypt from 'bcrypt';
import { cloneDeep } from 'lodash';
import { Types } from 'mongoose';

import { User } from '../../app/api/support/users.module';

export function createMockUser(id: number, prefix: string, scope?: string): User {
  const password = bcrypt.hashSync(prefix + '1!', 10);
  return {
    _id: new Types.ObjectId(),
    username: prefix + id,
    password,
    email: prefix + id + '@trains.com',
    created: new Date(),
    updated: new Date(),
    deleted: null,
    scope: scope || 'USER'
  };
}

export const MOCK_USERS: User[] = [
  createMockUser(1, 'testUser'),
  createMockUser(2, 'testUser'),
  createMockUser(3, 'testUser'),
  createMockUser(10, 'testAdmin', 'ADMIN')
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
      return this.users.find(user => user._id.toString() === data);
    }

    let ret = null;
    if (data.email) {
      ret = this.users.find(user => user.email === data.email);
    } else if (data._id) {
      ret = this.users.find(user => user._id.toString() === data._id);
    }

    return ret;
  }

  create(user: User) {
    if (user._id) {
      return {
        ...user,
        modified: new Date()
      };
    }

    return {
      ...user,
      id: user.username,
      created: new Date(),
      modified: new Date()
    };
  }

  update(uuid: string, user: User) {
    user = {
      ...this.users.find(u => u._id.toString() === uuid),
      ...user
    };

    this.users = [...this.users.filter(u => u._id.toString() !== uuid), user];

    return user;
  }

  save(user: User) {
    this.users = [...this.users.filter(u => u.username !== user.username), user];
    return user;
  }

  delete(uuid: string) {
    const entity = this.users.find(user => user._id.toString() === uuid);
    this.users = this.users.filter(user => user._id.toString() !== uuid);
    return { affected: !!entity };
  }
}

export const mockedUsersRepository = new MockUsersRepository();
