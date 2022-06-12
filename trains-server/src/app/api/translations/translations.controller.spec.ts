import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExceptionsLoggerFilter } from '../../../utils/exceptions-logger.filter';
import { authMocks } from '../../../utils/mocks/auth.mock';
import { MockRepository } from '../../../utils/mocks/repository.mock';
import * as request from 'supertest';
import Translation from './translation.entity';
import { TranslationMapper } from './translation.mapper';
import { TranslationsController } from './translations.controller';
import { TranslationsService } from './translations.service';
import { getAuthorizationBearer } from '../../../utils/jwt';
import { pick, range } from 'lodash';
import { TranslationDto } from '../../../models/translation.model';

const createTranslation = (id: number): Translation => {
  return {
    id: 'ID' + id,
    version: 0,
    created: new Date(),
    updated: new Date(),
    deleted: null,
    language: id % 2 ? 'en-US' : 'en-GB',
    key: 'com.ikarsoft.string-' + id,
    content: 'This is string # ' + id,
  };
};

const dto = (domain: Translation): TranslationDto => {
  return pick(domain, ['id', 'language', 'key', 'content']);
};

const createDto = (domain: Translation): TranslationDto => {
  return pick(domain, ['language', 'key', 'content']);
};

describe('Translations Controller', () => {
  let module: TestingModule;
  let app: INestApplication;
  let controller: TranslationsController;
  let service: TranslationsService;
  let repository: any;

  const T1 = createTranslation(1);
  const T2 = createTranslation(2);
  const T3 = createTranslation(3);
  const T4 = createTranslation(4);
  const T5 = createTranslation(5);
  const T6 = createTranslation(6);
  const T7 = createTranslation(7);
  const T8 = createTranslation(8);
  const T9 = createTranslation(9);

  const TRANSLATIONS = [T1, T2, T3, T4, T5, T6, T7, T8];

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [TranslationsController],
      providers: [
        ...authMocks,

        TranslationMapper,
        TranslationsService,
        {
          provide: getRepositoryToken(Translation),
          useValue: new MockRepository(TRANSLATIONS),
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new ExceptionsLoggerFilter());
    await app.init();

    controller = module.get<TranslationsController>(TranslationsController);
    service = module.get<TranslationsService>(TranslationsService);
    repository = module.get(getRepositoryToken(Translation));
  });

  afterEach(async () => {
    await app.close();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('GET /transactions', () => {
    it('should return 401 if no token is present or token is for non-existent user', async () => {
      await request(app.getHttpServer()).get('/translations').expect(401);

      await request(app.getHttpServer())
        .get('/translations')
        .set({ Authorization: getAuthorizationBearer(module, 'UnknownID') })
        .expect(404);
    });

    it('should return posts when logged in as normal user', async () => {
      const mockFind = jest.spyOn(repository, 'getMany');

      await request(app.getHttpServer())
        .get('/translations')
        .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
        .expect(200)
        .expect((res) => {
          expect(res).toBeDefined();
          expect(res.body).toBeDefined();
          expect(res.body.data.length).toEqual(8);
          expect(res.body.totalCount).toEqual(8);
          expect(res.body.page).toEqual(1);
          expect(res.body.limit).toEqual(10);

          range(8).forEach((index) => {
            const t = TRANSLATIONS[index];
            const v = res.body.data[index];

            expect(v).toEqual(dto(t));
          });
        });

      expect(mockFind).toHaveBeenCalled();
    });
  });

  describe('GET /translations/:id', () => {
    it('should return 401 if no token is present', async () => {
      await request(app.getHttpServer()).get('/translations/ID1').expect(401);
    });

    it('should return 404 if token is for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/translations/ID1')
        .set({ Authorization: getAuthorizationBearer(module, 'UnknownID') })
        .expect(404);
    });

    it('should return 404 if looking for non-existing place', async () => {
      await request(app.getHttpServer())
        .get('/translations/ID99')
        .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
        .expect(404);
    });

    it('should return data when logged in as normal user', async () => {
      jest.spyOn(repository, 'findOne').mockReturnValue(Promise.resolve(T1));

      await request(app.getHttpServer())
        .get('/translations/ID1')
        .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body).toEqual(dto(T1));
        });
    });
  });

  describe('POST /translations', () => {
    const addTranslation = createDto(T9);

    it('should return error if no token is present, token is for non-existent user or token is for normal user', async () => {
      // unauthorized
      await request(app.getHttpServer())
        .post('/translations')
        .send(addTranslation)
        .expect(401);

      // not-found (user from token)
      await request(app.getHttpServer())
        .post('/translations')
        .send(addTranslation)
        .set({ Authorization: getAuthorizationBearer(module, 'UnknownID') })
        .expect(404);

      // forbidden (wrong user scope)
      await request(app.getHttpServer())
        .post('/translations')
        .send(addTranslation)
        .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
        .expect(403);
    });

    it('should create a new place', async () => {
      const mockCreate = jest.spyOn(repository, 'create').mockReturnValue(T9);

      const mockSave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(T9));

      await request(app.getHttpServer())
        .post('/translations')
        .send(addTranslation)
        .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(dto(T9));
        });

      expect(mockCreate).toHaveBeenCalledWith(addTranslation);
      expect(mockSave).toHaveBeenCalledWith(T9);
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
        .set({ Authorization: getAuthorizationBearer(module, 'UnknownID') })
        .expect(404);
    });

    it('should return 403 token is for normal user', async () => {
      // forbidden (wrong user scope)
      await request(app.getHttpServer())
        .put('/translations/ID4')
        .send(updateTranslation)
        .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
        .expect(403);
    });

    it('should return 404 if trying to update unknown place', async () => {
      // not-found (user from token)
      await request(app.getHttpServer())
        .put('/translations/ID99')
        .send(updateTranslation)
        .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
        .expect(404);
    });

    it('should update existing place', async () => {
      const mockUpdate = jest.spyOn(repository, 'update');

      await request(app.getHttpServer())
        .put('/translations/ID1')
        .send(updateTranslation)
        .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            ...dto(T1),
            content: 'UpdatedContent',
          });
        });

      expect(mockUpdate).toHaveBeenCalledWith('ID1', updateTranslation);
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
        .set({ Authorization: getAuthorizationBearer(module, 'UnknownID') })
        .expect(404);
    });

    it('should return 403 token is for normal user', async () => {
      // forbidden (wrong user scope)
      await request(app.getHttpServer())
        .delete('/translations/ID4')
        .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
        .expect(403);
    });

    it('should return 404 if trying to delete unknown place', async () => {
      // not-found (user from token)
      await request(app.getHttpServer())
        .delete('/translations/ID99')
        .set({ Authorization: getAuthorizationBearer(module, 'ID10') })
        .expect(404);
    });

    //     .expect(200)
    //     .expect('true');
    //
    //   expect(mockDelete).toHaveBeenCalledWith('ID1');
    // });
  });
});
