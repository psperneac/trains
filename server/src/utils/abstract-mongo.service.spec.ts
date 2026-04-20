import { Types } from 'mongoose';
import { AbstractMongoService } from './abstract-mongo.service';
import { AbstractMongoEntity } from './abstract-mongo.entity';

class TestEntity extends AbstractMongoEntity {
  name: string;
  description: string;
}

describe('AbstractMongoService', () => {
  let service: AbstractMongoService<TestEntity>;
  let mockModel: any;

  const validObjectId = new Types.ObjectId();
  const validObjectIdStr = validObjectId.toString();

  const createMockDoc = (overrides: any = {}): any => {
    const id = overrides._id || new Types.ObjectId();
    const doc = {
      _id: id,
      name: 'Test',
      description: 'Test description',
      created: new Date(),
      updated: new Date(),
      deleted: null,
      toObject: jest.fn().mockReturnValue({
        _id: id,
        name: 'Test',
        description: 'Test description',
        created: new Date(),
        updated: new Date(),
        deleted: null,
      }),
      ...overrides,
    };
    return doc;
  };

  const createChainableMock = (resolvedValue: any) => ({
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(resolvedValue),
  });

  beforeEach(() => {
    mockModel = {
      find: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn(),
      }),
      findById: jest.fn().mockReturnValue({
        exec: jest.fn(),
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn(),
      }),
      findByIdAndDelete: jest.fn().mockReturnValue({
        exec: jest.fn(),
      }),
      countDocuments: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      }),
    };

    service = new AbstractMongoService<TestEntity>(mockModel);
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const docs = [createMockDoc(), createMockDoc()];
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(docs),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).not.toHaveProperty('_doc');
      expect(result.data[0]).not.toHaveProperty('$__');
    });

    it('should return unpaged results when unpaged is true', async () => {
      const docs = [createMockDoc()];
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(docs),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAll({ unpaged: true });

      expect(result.limit).toBe(1);
    });
  });

  describe('findAllWhere', () => {
    it('should return filtered results', async () => {
      const docs = [createMockDoc({ name: 'Filtered' })];
      docs[0].toObject.mockReturnValue({
        _id: docs[0]._id,
        name: 'Filtered',
        description: 'Test description',
        created: new Date(),
        updated: new Date(),
        deleted: null,
      });
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(docs),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAllWhere({ name: 'Filtered' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Filtered');
    });
  });

  describe('findOne', () => {
    it('should return a single document', async () => {
      const doc = createMockDoc({ _id: validObjectId });
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });

      const result = await service.findOne(validObjectIdStr);

      expect(result).toHaveProperty('id');
      expect(result).not.toHaveProperty('_doc');
      expect(result).not.toHaveProperty('$__');
    });

    it('should return null when document not found', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOne(validObjectIdStr);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a document', async () => {
      const doc = createMockDoc({ _id: validObjectId });
      const mockSave = jest.fn().mockResolvedValue(doc);

      mockModel = function() {
        return { save: mockSave };
      };
      service = new AbstractMongoService<TestEntity>(mockModel);

      const entity = { name: 'New', description: 'New description' };
      const result = await service.create(entity as any);

      expect(result).toHaveProperty('id');
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return the updated document', async () => {
      const doc = createMockDoc({ _id: validObjectId, name: 'Updated' });
      doc.toObject.mockReturnValue({
        _id: validObjectId,
        name: 'Updated',
        description: 'Test description',
        created: new Date(),
        updated: new Date(),
        deleted: null,
      });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });

      const result = await service.update(validObjectIdStr, { name: 'Updated' } as any);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', 'Updated');
    });

    it('should return null when document not found', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.update(validObjectIdStr, { name: 'Test' } as any);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should return true when document is deleted', async () => {
      mockModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(createMockDoc({ _id: validObjectId })),
      });

      const result = await service.delete(validObjectIdStr);

      expect(result).toBe(true);
    });

    it('should return false when document not found', async () => {
      mockModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.delete(validObjectIdStr);

      expect(result).toBe(false);
    });
  });
});
