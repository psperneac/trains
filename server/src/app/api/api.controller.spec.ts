import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { keys, pick, range } from 'lodash';
import * as request from 'supertest';

import { AllExceptionsFilter } from '../../utils/all-exceptions.filter';
import { getAuthorizationBearer } from '../../utils/jwt';
import { authMocks } from '../../utils/mocks/auth.mock';
import { MockRepository } from '../../utils/mocks/repository.mock';
import { TestConfig } from '../../utils/test/test-config';

import { getTestProviders } from './../../utils/test/test-config';
import { JobTestConfig } from './jobs/job-test-config';
import { PlaceConnectionTestConfig } from './places/place-connection-test-config';
import { TranslationTestConfig } from './translations/translations-test-config';
import { VehicleTestConfig } from './vehicles/vehicle-test-config';

describe('Abstract Controller', () => {
  let module: TestingModule;
  let app: INestApplication;
  const configs: TestConfig<any, any>[] = [
    TranslationTestConfig,
    VehicleTestConfig,
    PlaceConnectionTestConfig,
    JobTestConfig
  ];

  beforeAll(async () => {
    jest.setTimeout(100000);
  });

  beforeEach(async () => {
    const providers = [
      ...authMocks,
      ...configs.flatMap(config => (config.createProviders ? config.createProviders(config) : getTestProviders(config)))
    ];

    try {
      module = await Test.createTestingModule({
        controllers: [...configs.map(config => config.controllerClass)],
        providers
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
      });
    } catch (e) {
      console.log(e);
    }
  });

  afterEach(async () => {
    await app.close();
    jest.resetAllMocks();
  });

  describe.each(configs)('For all configs', config => {
    describe(`GET ${config.url}`, () => {
      it('should return 401 if no token is present or token is for non-existent user', async () => {
        await request(app.getHttpServer()).get(config.url).expect(401);

        await request(app.getHttpServer())
          .get(config.url)
          .set({ Authorization: getAuthorizationBearer(module, 'UnknownID') })
          .expect(404);
      });

      it(`should return ${config.name} when logged in as normal user`, async () => {
        const mockFind = jest.spyOn(config.repository, 'getMany');

        await request(app.getHttpServer())
          .get(config.url)
          .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
          .expect(200)
          .expect(res => {
            expect(res).toBeDefined();
            expect(res.body).toBeDefined();
            expect(res.body.data.length).toEqual(9);
            expect(res.body.totalCount).toEqual(9);
            expect(res.body.page).toEqual(1);
            expect(res.body.limit).toEqual(10);

            range(8).forEach(async index => {
              const t = config.data[index];
              const v = res.body.data[index];
              const fromDto = await config.mapper.toDto(t);

              expect(v).toEqual(fromDto);
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
          .set({ Authorization: getAuthorizationBearer(module, 'UnknownID') })
          .expect(404);
      });

      it('should return 404 if looking for non-existing', async () => {
        await request(app.getHttpServer())
          .get(`${config.url}/${badId}`)
          .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
          .expect(404);
      });

      it('should return data when logged in as normal user', async () => {
        jest.spyOn(config.repository, 'findOne');

        await request(app.getHttpServer())
          .get(`${config.url}/${goodId}`)
          .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
          .expect(200)
          .expect(res => {
            expect(res.body).toBeDefined();
            config.mapper.toDto(config.data[0]).then(dto => {
              expect(res.body).toEqual(dto);
            });
          });
      });
    });

    describe(`POST ${config.url}`, () => {
      const addEntity = config.createUpdateDto(config.newEntityId);

      it('should return error if no token is present, token is for non-existent user or token is for normal user', async () => {
        // unauthorized
        await request(app.getHttpServer()).post(config.url).send(addEntity).expect(401);

        // not-found (user from token)
        await request(app.getHttpServer())
          .post(config.url)
          .send(addEntity)
          .set({ Authorization: getAuthorizationBearer(module, 'UnknownID') })
          .expect(404);

        // forbidden (wrong user scope)
        await request(app.getHttpServer())
          .post(config.url)
          .send(addEntity)
          .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
          .expect(403);
      });

      it(`should create a new ${config.name}`, async () => {
        const mockCreate = jest.spyOn(config.repository, 'create');
        const mockSave = jest.spyOn(config.repository, 'save');

        await request(app.getHttpServer())
          .post(config.url)
          .send(addEntity)
          .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
          .expect(201)
          .expect(res => {
            const created = pick(res.body, keys(addEntity));
            expect(created).toEqual(addEntity);
          });

        expect(mockCreate).toHaveBeenCalled();
        expect(mockSave).toHaveBeenCalled();
      });
    });

    describe(`PUT ${config.url}/:id`, () => {
      const updateEntity = config.createUpdateDto(config.existingEntityId);

      it('should return 401 if no token is present', async () => {
        // unauthorized
        await request(app.getHttpServer())
          .put(`${config.url}/ID${config.existingEntityId}`)
          .send(updateEntity)
          .expect(401);
      });

      it('should return 404 if token is for non-existent user', async () => {
        // not-found (user from token)
        await request(app.getHttpServer())
          .put(`${config.url}/ID${config.existingEntityId}`)
          .send(updateEntity)
          .set({ Authorization: getAuthorizationBearer(module, 'UnknownID') })
          .expect(404);
      });

      it('should return 403 token is for normal user', async () => {
        // forbidden (wrong user scope)
        await request(app.getHttpServer())
          .put(`${config.url}/ID${config.existingEntityId}`)
          .send(updateEntity)
          .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
          .expect(403);
      });

      it('should return 404 if trying to update unknown entity', async () => {
        // not-found (user from token)
        await request(app.getHttpServer())
          .put(`${config.url}/ID99`)
          .send(updateEntity)
          .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
          .expect(404);
      });

      it(`should update existing ${config.name}`, async () => {
        jest.setTimeout(100000);

        const mockUpdate = jest.spyOn(config.repository, 'update');

        const repo = config.repository as MockRepository<any>;
        const existing = repo.internalFind(`ID${config.existingEntityId}`);

        await request(app.getHttpServer())
          .put(`${config.url}/ID${config.existingEntityId}`)
          .send(updateEntity)
          .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
          .expect(200)
          .expect(res => {
            return config.mapper
              .toDto({
                ...existing,
                ...updateEntity
              })
              .then(dto => {
                expect(res.body).toEqual(dto);
              });
          });

        expect(mockUpdate).toHaveBeenCalled();
      });
    });

    describe(`DELETE ${config.url}/:id`, () => {
      it('should return 401 if no token is present', async () => {
        // unauthorized
        await request(app.getHttpServer()).delete(`${config.url}/ID${config.existingEntityId}`).expect(401);
      });

      it('should return 404 if token is for non-existent user', async () => {
        // not-found (user from token)
        await request(app.getHttpServer())
          .delete(`${config.url}/ID${config.existingEntityId}`)
          .set({ Authorization: getAuthorizationBearer(module, 'UnknownID') })
          .expect(404);
      });

      it('should return 403 token is for normal user', async () => {
        // forbidden (wrong user scope)
        await request(app.getHttpServer())
          .delete(`${config.url}/ID${config.existingEntityId}`)
          .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
          .expect(403);
      });

      it('should return 404 if trying to delete unknown translation', async () => {
        // not-found (user from token)
        await request(app.getHttpServer())
          .delete(`${config.url}/ID99`)
          .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
          .expect(404);
      });

      it('should delete a known translation', async () => {
        await request(app.getHttpServer())
          .delete(`${config.url}/ID${config.existingEntityId}`)
          .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
          .expect(200);
      });
    });
  });
});
