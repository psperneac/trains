import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { VehicleInstancesController, VehicleInstancesService, VehicleInstanceMapper } from './vehicle-instances.module';
import { JobsService, Job, JobType } from './jobs.module';

/**
 * Unit tests for VehicleInstancesController job endpoints:
 * - POST /vehicles/:id/load-job
 * - POST /vehicles/:id/unload-job
 */
describe('VehicleInstancesController - Job Endpoints', () => {
  let controller: VehicleInstancesController;
  let vehicleInstancesService: jest.Mocked<VehicleInstancesService>;
  let jobsService: jest.Mocked<JobsService>;

  const mockVehicleId = '507f1f77bcf86cd799439011';
  const mockJobId = '507f1f77bcf86cd799439012';
  const mockPlaceId = '507f1f77bcf86cd799439013';
  const mockVehicleTypeId = '507f1f77bcf86cd799439014';
  const mockPlayerId = '507f1f77bcf86cd799439015';

  const createMockPlaceInstance = () => ({
    _id: { toString: () => mockPlaceId } as any,
    place: { _id: { toString: () => 'place-template-1' }, name: 'Station A' },
    playerId: { toString: () => mockPlayerId } as any,
    jobOffers: [],
    content: {},
  });

  const createMockVehicleInstance = (status: 'AT_PLACE' | 'IN_TRANSIT' = 'AT_PLACE', currentPlaceId: string = mockPlaceId) => ({
    _id: { toString: () => mockVehicleId } as any,
    vehicleId: { toString: () => mockVehicleTypeId } as any,
    currentPlaceInstance: { ...createMockPlaceInstance(), _id: { toString: () => currentPlaceId } },
    destinationPlaceInstance: null,
    route: [],
    status,
    gameId: { toString: () => 'game-1' } as any,
    playerId: { toString: () => mockPlayerId } as any,
    content: {},
  });

  const createMockJob = (type: JobType, vehicleInstanceId: string | null = null, placeInstanceId: string | null = mockPlaceId) => ({
    _id: { toString: () => mockJobId } as any,
    type,
    name: 'Test Job',
    description: 'Test description',
    cargoType: 'Coal',
    load: 50,
    payType: 'GOLD',
    pay: 100,
    startTime: new Date(),
    startPlaceId: { toString: () => 'start-place' } as any,
    endPlaceId: { toString: () => 'end-place' } as any,
    placeInstanceId: placeInstanceId ? { toString: () => placeInstanceId } as any : null,
    vehicleInstanceId: vehicleInstanceId ? { toString: () => vehicleInstanceId } as any : null,
    vehicleId: vehicleInstanceId ? { toString: () => mockVehicleTypeId } as any : null,
    content: {},
  });

  const mockJobsService = {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockVehicleInstancesServiceMethods = {
    findOne: jest.fn(),
    findAllByPlayer: jest.fn(),
    findAllByPlayerAndMap: jest.fn(),
    update: jest.fn(),
  };

  const mockMapper = {
    toDto: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleInstancesController],
      providers: [
        { provide: VehicleInstancesService, useValue: mockVehicleInstancesServiceMethods },
        { provide: VehicleInstanceMapper, useValue: mockMapper },
        { provide: JobsService, useValue: mockJobsService },
      ],
    }).compile();

    controller = module.get<VehicleInstancesController>(VehicleInstancesController);
    vehicleInstancesService = mockVehicleInstancesServiceMethods as any;
    jobsService = mockJobsService as any;
  });

  describe('POST /vehicles/:id/load-job', () => {
    it('should load a VEHICLE type job onto a vehicle at the same place', async () => {
      const mockVehicle = createMockVehicleInstance();
      const mockJob = createMockJob(JobType.VEHICLE, null, mockPlaceId);

      vehicleInstancesService.findOne.mockResolvedValue(mockVehicle as any);
      jobsService.findOne.mockResolvedValue(mockJob as any);
      jobsService.update.mockResolvedValue(mockJob as any);

      const result = await controller.loadJob(mockVehicleId, { jobId: mockJobId });

      expect(jobsService.update).toHaveBeenCalledWith(mockJobId, expect.objectContaining({
        vehicleInstanceId: expect.anything(),
        vehicleId: mockVehicleTypeId,
      }));
    });

    it('should throw 404 when vehicle not found', async () => {
      vehicleInstancesService.findOne.mockResolvedValue(null);

      await expect(
        controller.loadJob(mockVehicleId, { jobId: mockJobId })
      ).rejects.toMatchObject({ status: 404 });
    });

    it('should throw 400 when vehicle is in transit', async () => {
      const mockVehicle = createMockVehicleInstance('IN_TRANSIT');
      vehicleInstancesService.findOne.mockResolvedValue(mockVehicle as any);

      await expect(
        controller.loadJob(mockVehicleId, { jobId: mockJobId })
      ).rejects.toMatchObject({ status: 400 });
    });

    it('should throw 404 when job not found', async () => {
      const mockVehicle = createMockVehicleInstance();
      vehicleInstancesService.findOne.mockResolvedValue(mockVehicle as any);
      jobsService.findOne.mockResolvedValue(null);

      await expect(
        controller.loadJob(mockVehicleId, { jobId: mockJobId })
      ).rejects.toMatchObject({ status: 404 });
    });

    it('should throw 400 when job is not VEHICLE type', async () => {
      const mockVehicle = createMockVehicleInstance();
      const mockJob = createMockJob(JobType.PLACE);
      vehicleInstancesService.findOne.mockResolvedValue(mockVehicle as any);
      jobsService.findOne.mockResolvedValue(mockJob as any);

      await expect(
        controller.loadJob(mockVehicleId, { jobId: mockJobId })
      ).rejects.toMatchObject({ status: 400 });
    });

    it('should throw 400 when job is not at vehicle location', async () => {
      const mockVehicle = createMockVehicleInstance();
      const mockJob = createMockJob(JobType.VEHICLE, null, 'different-place');
      vehicleInstancesService.findOne.mockResolvedValue(mockVehicle as any);
      jobsService.findOne.mockResolvedValue(mockJob as any);

      await expect(
        controller.loadJob(mockVehicleId, { jobId: mockJobId })
      ).rejects.toMatchObject({ status: 400 });
    });

    it('should throw 400 when job is already loaded on another vehicle', async () => {
      const mockVehicle = createMockVehicleInstance();
      const mockJob = createMockJob(JobType.VEHICLE, 'other-vehicle-id', mockPlaceId);
      vehicleInstancesService.findOne.mockResolvedValue(mockVehicle as any);
      jobsService.findOne.mockResolvedValue(mockJob as any);

      await expect(
        controller.loadJob(mockVehicleId, { jobId: mockJobId })
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  describe('POST /vehicles/:id/unload-job', () => {
    it('should unload a job and change it to PLACE type', async () => {
      const mockVehicle = createMockVehicleInstance();
      const mockJob = createMockJob(JobType.VEHICLE, mockVehicleId, null);

      vehicleInstancesService.findOne.mockResolvedValue(mockVehicle as any);
      jobsService.findOne.mockResolvedValue(mockJob as any);
      jobsService.update.mockResolvedValue(mockJob as any);

      await controller.unloadJob(mockVehicleId, { jobId: mockJobId });

      expect(jobsService.update).toHaveBeenCalledWith(mockJobId, expect.objectContaining({
        type: JobType.PLACE,
        placeInstanceId: expect.anything(),
        vehicleInstanceId: null,
        vehicleId: null,
      }));
    });

    it('should throw 404 when vehicle not found', async () => {
      vehicleInstancesService.findOne.mockResolvedValue(null);

      await expect(
        controller.unloadJob(mockVehicleId, { jobId: mockJobId })
      ).rejects.toMatchObject({ status: 404 });
    });

    it('should throw 400 when vehicle is in transit', async () => {
      const mockVehicle = createMockVehicleInstance('IN_TRANSIT');
      vehicleInstancesService.findOne.mockResolvedValue(mockVehicle as any);

      await expect(
        controller.unloadJob(mockVehicleId, { jobId: mockJobId })
      ).rejects.toMatchObject({ status: 400 });
    });

    it('should throw 404 when job not found', async () => {
      const mockVehicle = createMockVehicleInstance();
      vehicleInstancesService.findOne.mockResolvedValue(mockVehicle as any);
      jobsService.findOne.mockResolvedValue(null);

      await expect(
        controller.unloadJob(mockVehicleId, { jobId: mockJobId })
      ).rejects.toMatchObject({ status: 404 });
    });

    it('should throw 400 when job is not loaded on this vehicle', async () => {
      const mockVehicle = createMockVehicleInstance();
      const mockJob = createMockJob(JobType.VEHICLE, 'other-vehicle-id', null);
      vehicleInstancesService.findOne.mockResolvedValue(mockVehicle as any);
      jobsService.findOne.mockResolvedValue(mockJob as any);

      await expect(
        controller.unloadJob(mockVehicleId, { jobId: mockJobId })
      ).rejects.toMatchObject({ status: 400 });
    });
  });
});
