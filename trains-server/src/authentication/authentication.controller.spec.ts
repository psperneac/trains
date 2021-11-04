import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { authMocks } from '../utils/mocks/auth.mock';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getAuthorizationBearer } from '../utils/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import User from '../app/api/users/users.entity';
import { UsersService } from '../app/api/users/users.service';

describe('Authentication Controller', () => {
  let module: TestingModule;
  let app: INestApplication;
  let controller: AuthenticationController;
  let service: AuthenticationService;
  let usersService: UsersService;
  let repository: any;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [...authMocks, AuthenticationService],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    controller = module.get<AuthenticationController>(AuthenticationController);
    service = module.get<AuthenticationService>(AuthenticationService);
    usersService = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(async () => {
    await app.close();
    repository.reset();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /authentication', () => {
    it('should return 401 if calling w/o token', async () => {
      await request(app.getHttpServer()).get('/authentication').expect(401);
    });

    it('should return 401 if calling with token of unknown user', async () => {
      await request(app.getHttpServer())
        .get('/authentication')
        .set({ Authorization: getAuthorizationBearer(module, 'UnknownID') })
        .expect(404);
    });

    it('should return current logged in user', async () => {
      await request(app.getHttpServer())
        .get('/authentication')
        .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual('ID1');
        });
    });
  });

  describe('POST /authentication/register', () => {
    it('should call userService.create on a call to register', async () => {
      const mockCreate = spyOn(usersService, 'create').and.callThrough();

      await request(app.getHttpServer())
        .post('/authentication/register')
        .send({
          email: 'testRegistrationEmail@trains.com',
          username: 'testRegistration',
          password: 'passpass',
        })
        .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toEqual('testRegistration');
        });

      expect(mockCreate).toHaveBeenCalled();
    });
  });

  describe('POST /authentication/login', () => {
    it('should return an Authorization header', async () => {
      const mockAuthorization = spyOn(
        service,
        'getAuthorizationBearer',
      ).and.returnValue('Bearer 1234');
      const mockVerify = spyOn(service, 'verifyPassword').and.returnValue(true);

      await request(app.getHttpServer())
        .post('/authentication/login')
        .send({
          email: 'testUser1@trains.com',
          password: 'testUser1!',
        })
        .expect(200)
        .expect('Authorization', 'Bearer 1234');

      expect(mockAuthorization).toHaveBeenCalledWith('ID1');
      expect(mockVerify).toHaveBeenCalledWith('testUser1!', 'testUser1!');
    });
  });
});
