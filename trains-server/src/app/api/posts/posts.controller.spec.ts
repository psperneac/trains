import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import Post from './posts.entity';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getAuthorizationBearer } from '../../../utils/jwt';
import { authMocks } from '../../../utils/mocks/auth.mock';
import { MockRepository } from '../../../utils/mocks/repository.mock';
import { ExceptionsLoggerFilter } from '../../../utils/exceptions-logger.filter';

const createPost = (id: number): Post => {
  return {
    id: 'ID' + id,
    version: 0,
    created: new Date(),
    updated: new Date(),
    deleted: null,
    title: 'Title' + id,
    content: 'Content' + id,
  };
};

describe('Posts Controller', () => {
  let module: TestingModule;
  let app: INestApplication;
  let controller: PostsController;
  let service: PostsService;
  let repository: any;

  const POST1 = createPost(1);
  const POST2 = createPost(2);
  const POST3 = createPost(3);
  const POST4 = createPost(4);
  const POSTS = [POST1, POST2, POST3];

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        ...authMocks,

        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: new MockRepository(POSTS),
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new ExceptionsLoggerFilter());
    await app.init();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
    repository = module.get(getRepositoryToken(Post));
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  it('should return 401 if no token is present or token is for non-existent user', () => {
    request(app.getHttpServer()).get('/posts').expect(401);

    request(app.getHttpServer())
      .get('/posts')
      .set({ Authorization: getAuthorizationBearer(module, 'UnknownID') })
      .expect(401);
  });

  it('should return empty posts list', async () => {
    spyOn(repository, 'find').and.returnValue([]);

    await request(app.getHttpServer())
      .get('/posts')
      .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
      .expect(200)
      .expect([]);
  });

  it('should return posts as a list', async () => {
    spyOn(repository, 'find').and.returnValue(POSTS);

    await request(app.getHttpServer())
      .get('/posts')
      .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
      .expect(200)
      .expect(JSON.stringify(POSTS));
  });

  it('should call create and save when POST a new post', async () => {
    const mockSave = spyOn(repository, 'save');
    const mockCreate = spyOn(repository, 'create').and.returnValue(POST4);

    await request(app.getHttpServer())
      .post('/posts')
      .send({
        title: POST4.title,
        content: POST4.content,
      })
      .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
      .expect(201)
      .expect(JSON.stringify(POST4));

    expect(mockCreate).toHaveBeenCalledWith({
      title: POST4.title,
      content: POST4.content,
    });

    expect(mockSave).toHaveBeenCalledWith(POST4);
  });

  it('success. should update post and return updated post when PUT a post and known id', async () => {
    const mockUpdate = spyOn(repository, 'update');
    const mockFindOne = spyOn(repository, 'findOne').and.returnValue(POST4);

    await request(app.getHttpServer())
      .put('/posts/' + POST4.id)
      .send({
        id: POST4.id,
        title: POST4.title,
        content: POST4.content,
      })
      .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
      .expect(200)
      .expect(JSON.stringify(POST4));

    expect(mockUpdate).toHaveBeenCalledWith(POST4.id, {
      id: POST4.id,
      title: POST4.title,
      content: POST4.content,
    });

    expect(mockFindOne).toHaveBeenCalledWith(POST4.id);
  });

  it('not found. should return 404 when PUT a post and unknown id', async () => {
    const mockUpdate = spyOn(repository, 'update');
    const mockFindOne = spyOn(repository, 'findOne').and.returnValue(null);

    await request(app.getHttpServer())
      .put('/posts/' + POST4.id)
      .send({
        id: POST4.id,
        title: POST4.title,
        content: POST4.content,
      })
      .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
      .expect(404)
      .expect('{"statusCode":404,"message":"Post not found"}');

    expect(mockUpdate).toHaveBeenCalledWith(POST4.id, {
      id: POST4.id,
      title: POST4.title,
      content: POST4.content,
    });

    expect(mockFindOne).toHaveBeenCalledWith(POST4.id);
  });

  it('success. should return one post when GET with known id', async () => {
    const mockFindOne = spyOn(repository, 'findOne').and.returnValue(POST4);

    await request(app.getHttpServer())
      .get('/posts/' + POST4.id)
      .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
      .expect(200)
      .expect(JSON.stringify(POST4));

    expect(mockFindOne).toHaveBeenCalledWith(POST4.id);
  });

  it('not found. should return 404 when GET with unknown id', async () => {
    const mockFindOne = spyOn(repository, 'findOne').and.returnValue(null);

    await request(app.getHttpServer())
      .get('/posts/' + POST4.id)
      .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
      .expect(404)
      .expect('{"statusCode":404,"message":"Post not found"}');

    expect(mockFindOne).toHaveBeenCalledWith(POST4.id);
  });

  it('success. should call delete with the id when DELETE with id', async () => {
    const mockDelete = spyOn(repository, 'delete').and.returnValue({
      affected: true,
    });

    await request(app.getHttpServer())
      .delete('/posts/' + POST4.id)
      .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
      .expect(200)
      .expect(JSON.stringify(true));

    expect(mockDelete).toHaveBeenCalledWith(POST4.id);
  });

  it('not found. should call delete with the id when DELETE with id', async () => {
    const mockDelete = spyOn(repository, 'delete').and.returnValue({
      affected: false,
    });

    await request(app.getHttpServer())
      .delete('/posts/' + POST4.id)
      .set({ Authorization: getAuthorizationBearer(module, 'ID1') })
      .expect(404)
      .expect('{"statusCode":404,"message":"Post not found"}');

    expect(mockDelete).toHaveBeenCalledWith(POST4.id);
  });
});
