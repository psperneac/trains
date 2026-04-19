import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { JobsController, JobsService, Job, JobType, JobMapper } from './jobs.module';

/**
 * Unit tests for JobsController:
 * - GET /jobs/:id - get job details
 *
 * Note: The basic CRUD endpoints are provided by AbstractServiceController.
 * These tests verify the findOne behavior.
 */
describe('JobsController - Job Details', () => {
  let controller: JobsController;
  let jobsService: jest.Mocked<JobsService>;

  const mockJobId = '507f1f77bcf86cd799439011';
  const mockPlayerId = '507f1f77bcf86cd799439012';
  const mockPlaceInstanceId = '507f1f77bcf86cd799439013';

  const createMockJob = (overrides?: Partial<Job>) => ({
    _id: { toString: () => mockJobId } as any,
    type: JobType.VEHICLE,
    name: 'Coal Delivery',
    description: 'Deliver coal to the factory',
    cargoType: 'Coal',
    load: 50,
    payType: 'GOLD',
    pay: 100,
    startTime: new Date('2026-04-19T10:00:00Z'),
    startPlaceId: { toString: () => 'start-place' } as any,
    endPlaceId: { toString: () => 'end-place' } as any,
    placeInstanceId: { toString: () => mockPlaceInstanceId } as any,
    vehicleInstanceId: null,
    vehicleId: null,
    content: {},
    ...overrides,
  });

  const mockJobsServiceMethods = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockMapper = {
    toDto: jest.fn(),
    toDomain: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        { provide: JobsService, useValue: mockJobsServiceMethods },
        { provide: JobMapper, useValue: mockMapper },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
    jobsService = mockJobsServiceMethods as any;
  });

  describe('GET /jobs/:id', () => {
    it('should return job details when job exists', async () => {
      const mockJob = createMockJob();
      const mockJobDto = {
        id: mockJobId,
        name: 'Coal Delivery',
        description: 'Deliver coal to the factory',
        type: JobType.VEHICLE,
        cargoType: 'Coal',
        load: 50,
        payType: 'GOLD',
        pay: 100,
        startTime: '2026-04-19T10:00:00.000Z',
        startId: 'start-place',
        endId: 'end-place',
        startPlaceId: mockPlaceInstanceId,
        endPlaceId: 'end-place',
        placeInstanceId: mockPlaceInstanceId,
        vehicleInstanceId: null,
        vehicleId: null,
        content: {},
      };

      jobsService.findOne.mockResolvedValue(mockJob as any);
      mockMapper.toDto.mockResolvedValue(mockJobDto as any);

      const result = await controller.findOne(mockJobId);

      expect(result).toEqual(mockJobDto);
      expect(jobsService.findOne).toHaveBeenCalledWith(mockJobId);
      expect(mockMapper.toDto).toHaveBeenCalledWith(mockJob);
    });

    it('should throw 404 when job not found', async () => {
      jobsService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(mockJobId)).rejects.toThrow(HttpException);
      await expect(controller.findOne(mockJobId)).rejects.toMatchObject({
        status: 404,
      });
    });

    it('should throw 404 when mapper returns null', async () => {
      const mockJob = createMockJob();
      jobsService.findOne.mockResolvedValue(mockJob as any);
      mockMapper.toDto.mockResolvedValue(null);

      await expect(controller.findOne(mockJobId)).rejects.toMatchObject({
        status: 404,
      });
    });

    it('should return job with correct type for VEHICLE job', async () => {
      const mockJob = createMockJob({ type: JobType.VEHICLE });
      const mockJobDto = {
        id: mockJobId,
        type: JobType.VEHICLE,
        name: mockJob.name,
      };

      jobsService.findOne.mockResolvedValue(mockJob as any);
      mockMapper.toDto.mockResolvedValue(mockJobDto as any);

      const result = await controller.findOne(mockJobId);

      expect(result.type).toBe(JobType.VEHICLE);
    });

    it('should return job with correct type for PLACE job', async () => {
      const mockJob = createMockJob({ type: JobType.PLACE });
      const mockJobDto = {
        id: mockJobId,
        type: JobType.PLACE,
        name: mockJob.name,
      };

      jobsService.findOne.mockResolvedValue(mockJob as any);
      mockMapper.toDto.mockResolvedValue(mockJobDto as any);

      const result = await controller.findOne(mockJobId);

      expect(result.type).toBe(JobType.PLACE);
    });
  });
});
