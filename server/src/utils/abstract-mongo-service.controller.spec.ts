import { HttpException, HttpStatus } from '@nestjs/common';
import { Types } from 'mongoose';
import { AbstractMongoServiceController } from './abstract-mongo-service.controller';
import { AbstractMongoEntity } from './abstract-mongo.entity';
import { AbstractMongoService } from './abstract-mongo.service';
import { AbstractDtoMapper } from './abstract-dto-mapper';

class TestEntity extends AbstractMongoEntity {
  name: string;
  description: string;
}

interface TestDto {
  id: string;
  name: string;
  description: string;
}

describe('AbstractMongoServiceController', () => {
  let controller: AbstractMongoServiceController<TestEntity, TestDto>;
  let mockService: jest.MockedObject<AbstractMongoService<TestEntity>>;
  let mockMapper: jest.MockedObject<AbstractDtoMapper<TestEntity, TestDto>>;

  const validObjectId = new Types.ObjectId();
  const validObjectIdStr = validObjectId.toString();

  const createMockEntity = (overrides: Partial<TestEntity> = {}): TestEntity => ({
    _id: validObjectId,
    name: 'Test',
    description: 'Test description',
    created: new Date(),
    updated: new Date(),
    deleted: null,
    ...overrides,
  } as TestEntity);

  const createMockDto = (overrides: Partial<TestDto> = {}): TestDto => ({
    id: validObjectIdStr,
    name: 'Test',
    description: 'Test description',
    ...overrides,
  });

  beforeEach(() => {
    mockService = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockMapper = {
      toDto: jest.fn(),
      toDomain: jest.fn(),
    } as any;

    controller = new AbstractMongoServiceController<TestEntity, TestDto>(mockService, mockMapper);
  });

  describe('findOne', () => {
    it('should return dto when entity found', async () => {
      const entity = createMockEntity();
      const dto = createMockDto();

      mockService.findOne.mockResolvedValue(entity);
      mockMapper.toDto.mockResolvedValue(dto);

      const result = await controller.findOne(validObjectIdStr);

      expect(result).toEqual(dto);
      expect(mockService.findOne).toHaveBeenCalledWith(validObjectIdStr);
      expect(mockMapper.toDto).toHaveBeenCalledWith(entity);
    });

    it('should throw 404 when entity not found', async () => {
      mockService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(validObjectIdStr)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw 404 when mapper returns null', async () => {
      const entity = createMockEntity();
      mockService.findOne.mockResolvedValue(entity);
      mockMapper.toDto.mockResolvedValue(null);

      await expect(controller.findOne(validObjectIdStr)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw 500 on service error', async () => {
      mockService.findOne.mockRejectedValue(new Error('Database error'));

      await expect(controller.findOne(validObjectIdStr)).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database error',
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated results with mapped data', async () => {
      const entities = [createMockEntity(), createMockEntity()];
      const dtos = [createMockDto(), createMockDto()];
      const page = {
        data: entities,
        page: 1,
        limit: 10,
        totalCount: 2,
      };

      mockService.findAll.mockResolvedValue(page as any);
      mockMapper.toDto.mockResolvedValue(dtos[0]);
      mockMapper.toDto.mockResolvedValueOnce(dtos[0]).mockResolvedValueOnce(dtos[1]);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(mockService.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create and return dto', async () => {
      const dto = createMockDto({ name: 'New' });
      const domain = createMockEntity({ name: 'New' });
      const created = createMockEntity({ name: 'New' });

      mockMapper.toDomain.mockResolvedValue(domain);
      mockService.create.mockResolvedValue(created);
      mockMapper.toDto.mockResolvedValue(dto);

      const result = await controller.create(dto, {} as any);

      expect(result).toEqual(dto);
      expect(mockMapper.toDomain).toHaveBeenCalledWith(dto);
      expect(mockService.create).toHaveBeenCalled();
      expect(mockMapper.toDto).toHaveBeenCalledWith(created);
    });

    it('should throw 500 on create error', async () => {
      const dto = createMockDto();
      mockMapper.toDomain.mockRejectedValue(new Error('Validation error'));

      await expect(controller.create(dto, {} as any)).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Validation error',
      });
    });
  });

  describe('update', () => {
    it('should update and return dto', async () => {
      const dto = createMockDto({ name: 'Updated' });
      const entity = createMockEntity();
      const updated = createMockEntity({ name: 'Updated' });
      const mergedDomain = { ...entity, name: 'Updated' };

      mockService.findOne.mockResolvedValue(entity);
      mockMapper.toDomain.mockResolvedValue(mergedDomain as TestEntity);
      mockService.update.mockResolvedValue(updated);
      mockMapper.toDto.mockResolvedValue(dto);

      const result = await controller.update(validObjectIdStr, dto, {} as any);

      expect(result).toEqual(dto);
      expect(mockService.findOne).toHaveBeenCalledWith(validObjectIdStr);
      expect(mockService.update).toHaveBeenCalled();
    });

    it('should throw 404 when entity not found', async () => {
      const dto = createMockDto();
      mockService.findOne.mockResolvedValue(null);

      await expect(controller.update(validObjectIdStr, dto, {} as any)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should throw 500 on update error', async () => {
      const dto = createMockDto();
      const entity = createMockEntity();
      mockService.findOne.mockResolvedValue(entity);
      mockMapper.toDomain.mockRejectedValue(new Error('Merge error'));

      await expect(controller.update(validObjectIdStr, dto, {} as any)).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Merge error',
      });
    });
  });

  describe('patch', () => {
    it('should patch and return dto', async () => {
      const dto = createMockDto({ name: 'Patched' });
      const entity = createMockEntity();
      const patchedDomain = { ...entity, name: 'Patched' };
      const updated = createMockEntity({ name: 'Patched' });

      mockService.findOne.mockResolvedValue(entity);
      mockMapper.toDomain.mockResolvedValue(patchedDomain as TestEntity);
      mockService.update.mockResolvedValue(updated);
      mockMapper.toDto.mockResolvedValue(dto);

      const result = await controller.patch(validObjectIdStr, dto, {} as any);

      expect(result).toEqual(dto);
      expect(mockService.findOne).toHaveBeenCalledWith(validObjectIdStr);
      expect(mockService.update).toHaveBeenCalled();
    });

    it('should throw 404 when entity not found', async () => {
      const dto = createMockDto();
      mockService.findOne.mockResolvedValue(null);

      await expect(controller.patch(validObjectIdStr, dto, {} as any)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('remove', () => {
    it('should delete and return true on success', async () => {
      mockService.delete.mockResolvedValue(true);

      const result = await controller.remove(validObjectIdStr, {} as any);

      expect(mockService.delete).toHaveBeenCalledWith(validObjectIdStr);
      expect(result).toBe(true);
    });

    it('should throw 500 on delete error', async () => {
      mockService.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(controller.remove(validObjectIdStr, {} as any)).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Delete failed',
      });
    });
  });

  describe('handlePagedResults', () => {
    it('should map all items in page', async () => {
      const entity1 = createMockEntity();
      const entity2 = createMockEntity();
      const dto1 = createMockDto();
      const dto2 = createMockDto();
      const page = {
        data: [entity1, entity2],
        page: 1,
        limit: 10,
        totalCount: 2,
      };

      mockMapper.toDto.mockResolvedValueOnce(dto1).mockResolvedValueOnce(dto2);

      const result = await controller.handlePagedResults(page, mockMapper);

      expect(result.data).toEqual([dto1, dto2]);
      expect(mockMapper.toDto).toHaveBeenCalledTimes(2);
    });

    it('should handle empty page', async () => {
      const page = { data: [], page: 1, limit: 10, totalCount: 0 };

      const result = await controller.handlePagedResults(page, mockMapper);

      expect(result.data).toEqual([]);
    });
  });

  describe('makeHandler', () => {
    it('should return a function', () => {
      const handler = controller.makeHandler();
      expect(typeof handler).toBe('function');
    });
  });
});
