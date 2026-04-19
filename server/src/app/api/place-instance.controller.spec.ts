import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { PlaceInstanceController } from './place-instance.module';
import { PlaceInstancesService, PlaceInstance, PlaceInstanceMapper } from './place-instance.module';
import { JobsService, Job } from './jobs.module';

/**
 * Unit tests for PlaceInstanceController job endpoints:
 * - GET /place-instances/:id/jobs
 * - POST /place-instances/:id/accept-job
 * - POST /place-instances/:id/warehouse-job
 */
describe('PlaceInstanceController - Job Endpoints', () => {
  let controller: PlaceInstanceController;
  let placeInstancesService: jest.Mocked<PlaceInstancesService>;
  let jobsService: jest.Mocked<JobsService>;

  const mockPlaceId = '507f1f77bcf86cd799439011';
  const mockPlaceInstanceId = '507f1f77bcf86cd799439012';
  const mockJobOfferId = '507f1f77bcf86cd799439013';
  const mockPlayerId = '507f1f77bcf86cd799439014';
  const mockGameId = '507f1f77bcf86cd799439015';

  const createMockPlace = () => ({
    _id: { toString: () => mockPlaceId } as any,
    name: 'Test Station',
    description: 'A test station',
    type: 'station',
    lat: 40.7128,
    lng: -74.006,
    gameId: { toString: () => mockGameId } as any,
  });

  const createMockPlaceInstance = (jobOffers: any[] = []) => ({
    _id: { toString: () => mockPlaceInstanceId } as any,
    place: createMockPlace(),
    playerId: { toString: () => mockPlayerId } as any,
    gameId: { toString: () => mockGameId } as any,
    jobOffers,
    content: {},
  });

  const createMockJobOffer = (id: string = mockJobOfferId) => ({
    jobOfferId: id,
    name: 'Delivery to Warehouse',
    description: 'Transport Coal to destination',
    cargoType: 'Coal',
    startId: mockPlaceId,
    endId: '507f1f77bcf86cd799439020',
    load: 50,
    payType: 'GOLD',
    pay: 100,
    startTime: new Date(),
    content: {},
  });

  const mockJobOffersService = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPlaceInstancesServiceMethods = {
    findOne: jest.fn(),
    findJobOffer: jest.fn(),
    removeJobOffer: jest.fn(),
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
      controllers: [PlaceInstanceController],
      providers: [
        { provide: PlaceInstancesService, useValue: mockPlaceInstancesServiceMethods },
        { provide: PlaceInstanceMapper, useValue: mockMapper },
        { provide: JobsService, useValue: mockJobOffersService },
      ],
    }).compile();

    controller = module.get<PlaceInstanceController>(PlaceInstanceController);
    placeInstancesService = mockPlaceInstancesServiceMethods as any;
    jobsService = mockJobOffersService as any;
  });

  describe('GET /place-instances/:id/jobs', () => {
    it('should return job offers for a place instance', async () => {
      const jobOffers = [createMockJobOffer(), createMockJobOffer('offer-2')];
      const mockPlaceInstance = createMockPlaceInstance(jobOffers);

      placeInstancesService.findOne.mockResolvedValue(mockPlaceInstance as any);

      const result = await controller.getJobs(mockPlaceInstanceId);

      expect(result).toHaveLength(2);
      expect(result[0].cargoType).toBe('Coal');
      expect(placeInstancesService.findOne).toHaveBeenCalledWith(mockPlaceInstanceId);
    });

    it('should return empty array when no job offers', async () => {
      const mockPlaceInstance = createMockPlaceInstance([]);

      placeInstancesService.findOne.mockResolvedValue(mockPlaceInstance as any);

      const result = await controller.getJobs(mockPlaceInstanceId);

      expect(result).toHaveLength(0);
    });

    it('should throw 404 when place instance not found', async () => {
      placeInstancesService.findOne.mockResolvedValue(null);

      await expect(controller.getJobs(mockPlaceInstanceId)).rejects.toThrow(HttpException);
      await expect(controller.getJobs(mockPlaceInstanceId)).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe('POST /place-instances/:id/accept-job', () => {
    it('should create a VEHICLE type job when accepting an offer', async () => {
      const jobOffer = createMockJobOffer();
      const mockPlaceInstance = createMockPlaceInstance([jobOffer]);
      const createdJob = {
        _id: { toString: () => 'new-job-id' } as any,
        type: 'VEHICLE',
        name: jobOffer.name,
        cargoType: jobOffer.cargoType,
        load: jobOffer.load,
        payType: jobOffer.payType,
        pay: jobOffer.pay,
      };

      placeInstancesService.findJobOffer.mockResolvedValue(jobOffer);
      placeInstancesService.findOne.mockResolvedValue(mockPlaceInstance as any);
      jobsService.create.mockResolvedValue(createdJob as any);
      jobsService.findOne.mockResolvedValue(createdJob as any);

      const result = await controller.acceptJob(mockPlaceInstanceId, { jobOfferId: mockJobOfferId });

      expect(jobsService.create).toHaveBeenCalledWith(expect.objectContaining({
        type: 'VEHICLE',
        name: jobOffer.name,
        cargoType: jobOffer.cargoType,
      }));
      expect(placeInstancesService.removeJobOffer).toHaveBeenCalledWith(mockPlaceInstanceId, mockJobOfferId);
    });

    it('should throw 404 when job offer not found', async () => {
      placeInstancesService.findJobOffer.mockResolvedValue(null);

      await expect(
        controller.acceptJob(mockPlaceInstanceId, { jobOfferId: mockJobOfferId })
      ).rejects.toThrow(HttpException);
    });

    it('should throw 404 when place instance not found', async () => {
      placeInstancesService.findJobOffer.mockResolvedValue(createMockJobOffer());
      placeInstancesService.findOne.mockResolvedValue(null);

      await expect(
        controller.acceptJob(mockPlaceInstanceId, { jobOfferId: mockJobOfferId })
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('POST /place-instances/:id/warehouse-job', () => {
    it('should create a PLACE type job when warehousing an offer', async () => {
      const jobOffer = createMockJobOffer();
      const mockPlaceInstance = createMockPlaceInstance([jobOffer]);
      const createdJob = {
        _id: { toString: () => 'new-job-id' } as any,
        type: 'PLACE',
        name: jobOffer.name,
        cargoType: jobOffer.cargoType,
        load: jobOffer.load,
        payType: jobOffer.payType,
        pay: jobOffer.pay,
      };

      placeInstancesService.findJobOffer.mockResolvedValue(jobOffer);
      placeInstancesService.findOne.mockResolvedValue(mockPlaceInstance as any);
      jobsService.create.mockResolvedValue(createdJob as any);
      jobsService.findOne.mockResolvedValue(createdJob as any);

      const result = await controller.warehouseJob(mockPlaceInstanceId, { jobOfferId: mockJobOfferId });

      expect(jobsService.create).toHaveBeenCalledWith(expect.objectContaining({
        type: 'PLACE',
        name: jobOffer.name,
        cargoType: jobOffer.cargoType,
      }));
      expect(placeInstancesService.removeJobOffer).toHaveBeenCalledWith(mockPlaceInstanceId, mockJobOfferId);
    });

    it('should throw 404 when job offer not found', async () => {
      placeInstancesService.findJobOffer.mockResolvedValue(null);

      await expect(
        controller.warehouseJob(mockPlaceInstanceId, { jobOfferId: mockJobOfferId })
      ).rejects.toThrow(HttpException);
    });

    it('should throw 404 when place instance not found', async () => {
      placeInstancesService.findJobOffer.mockResolvedValue(createMockJobOffer());
      placeInstancesService.findOne.mockResolvedValue(null);

      await expect(
        controller.warehouseJob(mockPlaceInstanceId, { jobOfferId: mockJobOfferId })
      ).rejects.toMatchObject({ status: 404 });
    });
  });
});
