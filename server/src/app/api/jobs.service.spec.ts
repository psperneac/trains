import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { JobsService, Job } from './jobs.module';

describe('JobsService', () => {
  let service: JobsService;

  const mockJobId = new ObjectId();
  const mockPlaceInstanceId = new ObjectId();
  const mockVehicleInstanceId = new ObjectId();
  const mockGameId = new ObjectId();

  const createMockJob = (overrides?: Partial<Job>): Job => ({
    _id: new Types.ObjectId(),
    type: 'VEHICLE' as const,
    name: 'Test Job',
    description: 'A test job',
    cargoType: 'Coal',
    load: 100,
    payType: 'FIXED',
    pay: 500,
    startTime: new Date(),
    startPlaceId: new ObjectId(),
    endPlaceId: new ObjectId(),
    placeInstanceId: mockPlaceInstanceId,
    vehicleInstanceId: mockVehicleInstanceId,
    content: {},
    created: new Date(),
    updated: new Date(),
    deleted: null as any,
    ...overrides,
  } as Job);

  const createMockModel = () => ({
    find: jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    }),
    findById: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    countDocuments: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    }),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
    findByIdAndDelete: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    }),
  });

  let mockModel: ReturnType<typeof createMockModel>;

  beforeEach(() => {
    mockModel = createMockModel();
    service = new JobsService(mockModel as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all jobs with pagination', async () => {
      const mockJob = createMockJob();
      (mockJob as any).toObject = jest.fn().mockReturnValue(mockJob);
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockJob]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.findAll({ unpaged: true } as any);

      expect(result.data).toHaveLength(1);
      expect(result.totalCount).toBe(1);
    });

    it('should return empty result when no jobs found', async () => {
      mockModel.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      const result = await service.findAll({ unpaged: true } as any);

      expect(result.data).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should find a job by id', async () => {
      const mockJob = createMockJob();
      (mockJob as any).toObject = jest.fn().mockReturnValue(mockJob);
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockJob),
      });

      const result = await service.findOne(mockJobId.toString());

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Test Job');
    });

    it('should return null when job not found', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findOne(mockJobId.toString());

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new job', async () => {
      const mockJob = createMockJob();
      const mockSavedJob = {
        ...mockJob,
        toObject: jest.fn().mockReturnValue(mockJob),
        save: jest.fn().mockResolvedValue(mockJob),
      };
      mockModel.create.mockResolvedValue(mockSavedJob);
      // Mock the constructor call
      (mockModel as any).constructor = jest.fn().mockImplementation(() => mockSavedJob);

      const result = await service.create({
        type: 'VEHICLE',
        name: 'New Job',
        cargoType: 'Coal',
        load: 100,
        pay: 500,
        payType: 'FIXED',
      } as any);

      expect(mockModel.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update an existing job', async () => {
      const mockJob = createMockJob();
      const mockUpdatedJob = { ...mockJob, name: 'Updated Job' };
      (mockUpdatedJob as any).toObject = jest.fn().mockReturnValue(mockUpdatedJob);
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdatedJob),
      });

      const result = await service.update(mockJobId.toString(), { name: 'Updated Job' } as any);

      expect(result).not.toBeNull();
    });

    it('should return null when job not found', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.update(mockJobId.toString(), { name: 'Updated Job' } as any);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a job', async () => {
      mockModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: mockJobId }),
      });

      const result = await service.delete(mockJobId.toString());

      expect(result).toBe(true);
    });

    it('should return false when job not found', async () => {
      mockModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.delete(mockJobId.toString());

      expect(result).toBe(false);
    });
  });
});