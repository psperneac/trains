import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';

import { CreateUserDto, UpdateUserDto } from '../../../models/user.model';
import { getAuthorizationBearer } from '../../../utils/jwt';
import { authMocks } from '../../../utils/mocks/auth.mock';
import { createMockUser, MOCK_USERS } from '../../../utils/mocks/users.repository.mock';

import { UsersController } from './users.controller';
import User from './users.entity';
import { UsersService } from './users.service';

describe('Users Controller', () => {
  let module: TestingModule;
  let app: INestApplication;
  let controller: UsersController;
  let service: UsersService;
  let repository: any;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [...authMocks, UsersService]
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(async () => {
    await app.close();
    repository.reset();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('check access annotations', () => {
    it('should return 401 if no user is logged in', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });

    it('should return 403 Forbidden if a user is logged in but is not ADMIN', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
        .expect(403);
    });

    it("should return 404 Not Found if an unknown user's token is passed in", async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set({ Authorization: getAuthorizationBearer(module, 'UnknownID') })
        .expect(404);
    });
  });

  describe('GET /users', () => {
    it('should return list of uses', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
        .expect(200)
        .expect(JSON.stringify(MOCK_USERS));
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user if id is known', async () => {
      await request(app.getHttpServer())
        .get('/users/ID1')
        .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
        .expect(200)
        .expect(JSON.stringify(repository.findOne('ID1')));
    });

    it('should return 404 if id is not known', async () => {
      await request(app.getHttpServer())
        .get('/users/ID99')
        .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
        .expect(404);
    });
  });

  describe('GET /users/by-email/:email', () => {
    it('should return a user if email is known', async () => {
      await request(app.getHttpServer())
        .get('/users/by-email/testUser1@trains.com')
        .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
        .expect(200)
        .expect(JSON.stringify(repository.findOne('ID1')));
    });

    it('should return 404 if the email is not known', async () => {
      await request(app.getHttpServer())
        .get('/users/by-email/testUser99@trains.com')
        .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
        .expect(404);
    });
  });

  describe('POST /users', () => {
    it('should insert a user if data is ok', async () => {
      const user = createMockUser(99, 'createdUser');
      const createUser: CreateUserDto = {
        email: user.email,
        username: user.username,
        password: user.password,
        scope: user.scope
      };

      const mockSave = jest.spyOn(repository, 'save');
      const mockCreate = jest.spyOn(repository, 'create'); //.and.returnValue(user);

      await request(app.getHttpServer())
        .post('/users')
        .send(createUser)
        .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
        .expect(201)
        .expect(res => {
          expect(res.body.id).toBeDefined();
          expect(res.body.created).toBeDefined();
          expect(res.body.modified).toBeDefined();

          expect(res.body.username).toEqual(createUser.username);
          expect(res.body.email).toEqual(createUser.email);
          expect(res.body.password).toEqual(createUser.password);
          expect(res.body.scope).toEqual(createUser.scope);
        });

      expect(mockCreate).toHaveBeenCalledWith(createUser);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('PUT /users/:id', () => {
    it('should update an existing item if id is known', async () => {
      const updateUser: UpdateUserDto = {
        email: 'updated-testUser1@trains.com',
        username: 'testUser1',
        password: 'updated-password',
        scope: 'USER'
      };

      const mockUpdate = jest.spyOn(repository, 'update');

      await request(app.getHttpServer())
        .put('/users/ID1')
        .send(updateUser)
        .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
        .expect(200)
        .expect(res => {
          expect(res.body.email).toEqual('updated-testUser1@trains.com');
          expect(res.body.password).toEqual('updated-password');
        });

      expect(mockUpdate).toHaveBeenCalledWith('ID1', updateUser);
    });

    it('should return 404 if id is not known', async () => {
      const updateUser: UpdateUserDto = {
        email: 'updated-testUser1@trains.com',
        username: 'testUser1',
        password: 'updated-password',
        scope: 'USER'
      };

      await request(app.getHttpServer())
        .put('/users/ID99')
        .send(updateUser)
        .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should call delete on repo with correct id', async () => {
      const mockDelete = jest.spyOn(repository, 'delete');

      await request(app.getHttpServer())
        .delete('/users/ID1')
        .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
        .expect(200)
        .expect('true');

      expect(mockDelete).toHaveBeenCalledWith('ID1');
    });

    it('should return 404 if id is not known', async () => {
      await request(app.getHttpServer())
        .delete('/users/ID99')
        .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
        .expect(404);
    });
  });
});
