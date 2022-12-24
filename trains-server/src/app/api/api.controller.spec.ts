import { Test, TestingModule } from '@nestjs/testing';
import { authMocks } from '../../utils/mocks/auth.mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository } from '../../utils/mocks/repository.mock';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import * as request from 'supertest';
import { getAuthorizationBearer } from '../../utils/jwt';
import { keys, pick, range } from 'lodash';
import { TranstationTestConfig } from './translations/translations-test-config';
import { TestConfig } from '../../utils/test/test-config';


describe('Abstract Controller', () => {
  let module: TestingModule;
  let app: INestApplication;
  const configs: TestConfig<any, any>[] = [
    TranstationTestConfig
  ];

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [...configs.map(config => config.controllerClass)],
      providers: [
        ...authMocks,

        ...configs.map(config => config.mapperClass),
        ...configs.map(config => config.serviceClass),
        ...configs.map(config => ({
          provide: getRepositoryToken(config.entityClass),
          useValue: new MockRepository(config.data)
        })),
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    configs.forEach(config => {
      config.controller = module.get(config.controllerClass);
      config.service = module.get(config.serviceClass);
      config.repository = module.get(getRepositoryToken(config.entityClass));
      config.mapper = module.get(config.mapperClass);
    })
  });

  afterEach(async () => {
    await app.close();
    jest.resetAllMocks();
  });

  describe.each(configs)('For all configs', (config) => {
    describe('GET ' + config.url, () => {
      it('should return 401 if no token is present or token is for non-existent user', async () => {
        await request(app.getHttpServer()).get(config.url).expect(401);

        await request(app.getHttpServer())
          .get(config.url)
          .set({Authorization: getAuthorizationBearer(module, 'UnknownID')})
          .expect(404);
      });

      it(`should return ${config.name} when logged in as normal user`, async () => {
        const mockFind = jest.spyOn(config.repository, 'getMany');

        await request(app.getHttpServer())
          .get(config.url)
          .set({Authorization: getAuthorizationBearer(module, 'ID1')})
          .expect(200)
          .expect((res) => {
            expect(res).toBeDefined();
            expect(res.body).toBeDefined();
            expect(res.body.data.length).toEqual(9);
            expect(res.body.totalCount).toEqual(9);
            expect(res.body.page).toEqual(1);
            expect(res.body.limit).toEqual(10);

            range(8).forEach((index) => {
              const t = config.data[index];
              const v = res.body.data[index];

              expect(v).toEqual(config.mapper.toDto(t));
            });
          });

        expect(mockFind).toHaveBeenCalled();
      });
    });

    describe(`GET ${config.url}/:id`, () => {
      const goodId = config.data[0].id;
      const badId = 'badID';

      it('should return 401 if no token is present', async () => {
        await request(app.getHttpServer()).get(`${config.url}/${goodId}`).expect(401);
      });

      it('should return 404 if token is for non-existent user', async () => {
        await request(app.getHttpServer())
          .get(`${config.url}/${goodId}`)
          .set({Authorization: getAuthorizationBearer(module, 'UnknownID')})
          .expect(404);
      });

      it('should return 404 if looking for non-existing', async () => {
        await request(app.getHttpServer())
          .get(`${config.url}/${badId}`)
          .set({Authorization: getAuthorizationBearer(module, 'ID1')})
          .expect(404);
      });

      it('should return data when logged in as normal user', async () => {
        jest.spyOn(config.repository, 'findOne');

        await request(app.getHttpServer())
          .get(`${config.url}/${goodId}`)
          .set({Authorization: getAuthorizationBearer(module, 'ID1')})
          .expect(200)
          .expect((res) => {
            expect(res.body).toBeDefined();
            expect(res.body).toEqual(config.mapper.toDto(config.data[0]));
          });
      });
    });

    describe('POST /translations', () => {
      const addTranslation = config.createUpdateDto(config.newEntityId);

      it('should return error if no token is present, token is for non-existent user or token is for normal user', async () => {
        // unauthorized
        await request(app.getHttpServer())
          .post('/translations')
          .send(addTranslation)
          .expect(401);

        // not-found (user from token)
        await request(app.getHttpServer())
          .post(config.url)
          .send(addTranslation)
          .set({Authorization: getAuthorizationBearer(module, 'UnknownID')})
          .expect(404);

        // forbidden (wrong user scope)
        await request(app.getHttpServer())
          .post(config.url)
          .send(addTranslation)
          .set({Authorization: getAuthorizationBearer(module, 'ID1')})
          .expect(403);
      });

      it('should create a new translation', async () => {
        const mockCreate = jest.spyOn(config.repository, 'create');

        const mockSave = jest.spyOn(config.repository, 'save');

        await request(app.getHttpServer())
          .post('/translations')
          .send(addTranslation)
          .set({Authorization: getAuthorizationBearer(module, 'ID10')})
          .expect(201)
          .expect((res) => {
            const created = pick(res.body, keys(addTranslation));
            expect(created).toEqual(addTranslation);
          });

        expect(mockCreate).toHaveBeenCalledWith(addTranslation);
        expect(mockSave).toHaveBeenCalled();
      });
    });

    describe('PUT /translations/:id', () => {
      const updateTranslation = {
        content: 'UpdatedContent',
      };

      it('should return 401 if no token is present', async () => {
        // unauthorized
        await request(app.getHttpServer())
          .put('/translations/ID4')
          .send(updateTranslation)
          .expect(401);
      });

      it('should return 404 if token is for non-existent user', async () => {
        // not-found (user from token)
        await request(app.getHttpServer())
          .put('/translations/ID4')
          .send(updateTranslation)
          .set({Authorization: getAuthorizationBearer(module, 'UnknownID')})
          .expect(404);
      });

      it('should return 403 token is for normal user', async () => {
        // forbidden (wrong user scope)
        await request(app.getHttpServer())
          .put('/translations/ID4')
          .send(updateTranslation)
          .set({Authorization: getAuthorizationBearer(module, 'ID1')})
          .expect(403);
      });

      it('should return 404 if trying to update unknown place', async () => {
        // not-found (user from token)
        await request(app.getHttpServer())
          .put('/translations/ID99')
          .send(updateTranslation)
          .set({Authorization: getAuthorizationBearer(module, 'ID10')})
          .expect(404);
      });

      it('should update existing translation', async () => {
        const mockUpdate = jest
          .spyOn(repository, 'update');

        await request(app.getHttpServer())
          .put('/translations/ID1')
          .send(updateTranslation)
          .set({Authorization: getAuthorizationBearer(module, 'ID10')})
          .expect(200)
          .expect((res) => {
            expect(res.body).toEqual({
              ...dto(T1),
              ...updateTranslation,
            });
          });

        expect(mockUpdate).toHaveBeenCalledWith('ID1', {
          ...T1,
          ...updateTranslation,
        });
      });
    });

    describe('DELETE /translations/:id', () => {
      it('should return 401 if no token is present', async () => {
        // unauthorized
        await request(app.getHttpServer())
          .delete('/translations/ID4')
          .expect(401);
      });

      it('should return 404 if token is for non-existent user', async () => {
        // not-found (user from token)
        await request(app.getHttpServer())
          .delete('/translations/ID4')
          .set({Authorization: getAuthorizationBearer(module, 'UnknownID')})
          .expect(404);
      });

      it('should return 403 token is for normal user', async () => {
        // forbidden (wrong user scope)
        await request(app.getHttpServer())
          .delete('/translations/ID4')
          .set({Authorization: getAuthorizationBearer(module, 'ID1')})
          .expect(403);
      });

      it('should return 404 if trying to delete unknown translation', async () => {
        // not-found (user from token)
        await request(app.getHttpServer())
          .delete('/translations/ID99')
          .set({Authorization: getAuthorizationBearer(module, 'ID10')})
          .expect(404);
      });

      it('should delete a known translation', async () => {
        await request(app.getHttpServer())
          .delete('/translations/ID1')
          .set({Authorization: getAuthorizationBearer(module, 'ID10')})
          .expect(200);
      });
    });
  });
});
