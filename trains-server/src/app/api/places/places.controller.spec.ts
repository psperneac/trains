import { Test, TestingModule } from '@nestjs/testing';
import { PlacesController } from './places.controller';
import { authMocks } from '../../../utils/mocks/auth.mock';
import { PlacesService } from './places.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockRepository } from '../../../utils/mocks/repository.mock';
import Place from './place.entity';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '../../../utils/all-exceptions.filter';
import * as request from 'supertest';
import { getAuthorizationBearer } from '../../../utils/jwt';
import { PlaceMapper } from './place.mapper';
import { pick } from 'lodash';

const createPlace = (id: number): Place => {
  return {
    id: 'ID' + id,
    version: 0,
    created: new Date(),
    updated: new Date(),
    deleted: null,
    name: 'Name' + id,
    description: 'Description' + id,
    type: 'RAIL',
    lat: 80 + id,
    long: 20 + id,
  };
};

describe('Places Controller', () => {
  let module: TestingModule;
  let app: INestApplication;
  let controller: PlacesController;
  let service: PlacesService;
  let repository: any;

  const PLACE1 = createPlace(1);
  const PLACE2 = createPlace(2);
  const PLACE3 = createPlace(3);
  const PLACE4 = createPlace(4);
  const PLACES = [PLACE1, PLACE2, PLACE3];

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [PlacesController],
      providers: [
        ...authMocks,

        PlaceMapper,
        PlacesService,
        {
          provide: getRepositoryToken(Place),
          useValue: new MockRepository(PLACES),
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    controller = module.get<PlacesController>(PlacesController);
    service = module.get<PlacesService>(PlacesService);
    repository = module.get(getRepositoryToken(Place));
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

  describe('GET /places', () => {
    it('should return 401 if no token is present or token is for non-existent user', async () => {
      await request(app.getHttpServer()).get('/places').expect(401);

      await request(app.getHttpServer())
        .get('/places')
        .set({Authorization: getAuthorizationBearer(module, 'UnknownID')})
        .expect(404);
    });

    it('should return posts when logged in as normal user', async () => {
      const mockFind = jest.spyOn(repository, 'getMany');

      await request(app.getHttpServer())
        .get('/places')
        .set({Authorization: getAuthorizationBearer(module, 'ID1')})
        .expect(200)
        .expect((res) => {
          expect(res).toBeDefined();
          expect(res.body).toBeDefined();
          expect(res.body.data.length).toEqual(3);
          expect(res.body.totalCount).toEqual(3);
          expect(res.body.page).toEqual(1);
          expect(res.body.limit).toEqual(10);

          expect(res.body.data[0]).toEqual({
            id: 'ID1',
            name: 'Name1',
            description: 'Description1',
            type: 'RAIL',
            lat: 81,
            long: 21,
          });
          expect(res.body.data[1]).toEqual({
            id: 'ID2',
            name: 'Name2',
            description: 'Description2',
            type: 'RAIL',
            lat: 82,
            long: 22,
          });
          expect(res.body.data[2]).toEqual({
            id: 'ID3',
            name: 'Name3',
            description: 'Description3',
            type: 'RAIL',
            lat: 83,
            long: 23,
          });
        });

      expect(mockFind).toHaveBeenCalled();
    });
  });

  describe('GET /places/:id', () => {
    it('should return 401 if no token is present', async () => {
      await request(app.getHttpServer()).get('/places/ID1').expect(401);
    });

    it('should return 404 if token is for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/places/ID1')
        .set({Authorization: getAuthorizationBearer(module, 'UnknownID')})
        .expect(404);
    });

    it('should return 404 ilooking for non-existing place', async () => {
      await request(app.getHttpServer())
        .get('/places/ID99')
        .set({Authorization: getAuthorizationBearer(module, 'ID1')})
        .expect(404);
    });

    it('should return data when logged in as normal user', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockReturnValue(Promise.resolve(PLACE1));

      await request(app.getHttpServer())
        .get('/places/ID1')
        .set({Authorization: getAuthorizationBearer(module, 'ID1')})
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
          expect(res.body).toEqual({
            id: 'ID1',
            name: 'Name1',
            description: 'Description1',
            type: 'RAIL',
            lat: 81,
            long: 21,
          });
        });
    });
  });

  describe('POST /places', () => {
    const addPlace = pick(PLACE4, [
      'name',
      'description',
      'type',
      'lat',
      'long',
    ]);

    it('should return error if no token is present, token is for non-existent user or token is for normal user', async () => {
      // unauthorized
      await request(app.getHttpServer())
        .post('/places')
        .send(addPlace)
        .expect(401);

      // not-found (user from token)
      await request(app.getHttpServer())
        .post('/places')
        .send(addPlace)
        .set({Authorization: getAuthorizationBearer(module, 'UnknownID')})
        .expect(404);

      // forbidden (wrong user scope)
      await request(app.getHttpServer())
        .post('/places')
        .send(addPlace)
        .set({Authorization: getAuthorizationBearer(module, 'ID1')})
        .expect(403);
    });

    it('should create a new place', async () => {
      const mockCreate = jest
        .spyOn(repository, 'create')
        .mockReturnValue(PLACE4);

      const mockSave = jest
        .spyOn(repository, 'save')
        .mockReturnValue(Promise.resolve(PLACE4));

      await request(app.getHttpServer())
        .post('/places')
        .send(addPlace)
        .set({Authorization: getAuthorizationBearer(module, 'ID10')})
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({
            id: 'ID4',
            name: 'Name4',
            description: 'Description4',
            type: 'RAIL',
            lat: 84,
            long: 24,
          });
        });

      expect(mockCreate).toHaveBeenCalledWith(addPlace);
      expect(mockSave).toHaveBeenCalledWith(PLACE4);
    });
  });

  describe('PUT /places/:id', () => {
    const updatePlace = {
      description: 'UpdatedDescription4',
    };

    it('should return 401 if no token is present', async () => {
      // unauthorized
      await request(app.getHttpServer())
        .put('/places/ID4')
        .send(updatePlace)
        .expect(401);
    });

    it('should return 404 if token is for non-existent user', async () => {
      // not-found (user from token)
      await request(app.getHttpServer())
        .put('/places/ID4')
        .send(updatePlace)
        .set({Authorization: getAuthorizationBearer(module, 'UnknownID')})
        .expect(404);
    });

    it('should return 403 token is for normal user', async () => {
      // forbidden (wrong user scope)
      await request(app.getHttpServer())
        .put('/places/ID4')
        .send(updatePlace)
        .set({Authorization: getAuthorizationBearer(module, 'ID1')})
        .expect(403);
    });

    it('should return 404 if trying to update unknown place', async () => {
      // not-found (user from token)
      await request(app.getHttpServer())
        .put('/places/ID99')
        .send(updatePlace)
        .set({Authorization: getAuthorizationBearer(module, 'ID10')})
        .expect(404);
    });

    it('should update existing place', async () => {
      const mockUpdate = jest.spyOn(repository, 'update'); //.and.callThrough();

      await request(app.getHttpServer())
        .put('/places/ID1')
        .send(updatePlace)
        .set({Authorization: getAuthorizationBearer(module, 'ID10')})
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            id: 'ID1',
            name: 'Name1',
            description: 'UpdatedDescription4',
            type: 'RAIL',
            lat: 81,
            long: 21,
          });
        });

      expect(mockUpdate).toHaveBeenCalledWith('ID1', updatePlace);
    });
  });

  describe('DELETE /places/:id', () => {
    it('should return 401 if no token is present', async () => {
      // unauthorized
      await request(app.getHttpServer()).delete('/places/ID4').expect(401);
    });

    it('should return 404 if token is for non-existent user', async () => {
      // not-found (user from token)
      await request(app.getHttpServer())
        .delete('/places/ID4')
        .set({Authorization: getAuthorizationBearer(module, 'UnknownID')})
        .expect(404);
    });

    it('should return 403 token is for normal user', async () => {
      // forbidden (wrong user scope)
      await request(app.getHttpServer())
        .delete('/places/ID4')
        .set({Authorization: getAuthorizationBearer(module, 'ID1')})
        .expect(403);
    });

    it('should return 404 if trying to delete unknown place', async () => {
      // not-found (user from token)
      await request(app.getHttpServer())
        .delete('/places/ID99')
        .set({Authorization: getAuthorizationBearer(module, 'ID10')})
        .expect(404);
    });

    //     .expect(200)
    //     .expect('true');
    //
    //   expect(mockDelete).toHaveBeenCalledWith('ID1');
    // });
  });
});
