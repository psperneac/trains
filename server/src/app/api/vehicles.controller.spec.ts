import { Test, TestingModule } from '@nestjs/testing';
import { ObjectId } from 'mongodb';
import { VehiclesController, VehicleDto } from './vehicles.module';
import { VehiclesService } from './vehicles.module';
import { VehicleMapper } from './vehicles.module';
import { PageDto } from '../../models/page.model';

describe('VehiclesController', () => {
  let controller: VehiclesController;
  let vehiclesService: jest.Mocked<VehiclesService>;
  let vehicleMapper: jest.Mocked<VehicleMapper>;

  const mockGameId = new ObjectId().toString();
  const mockVehicleId = new ObjectId().toString();

  const createMockVehicleDto = (): VehicleDto => ({
    id: mockVehicleId,
    type: 'STEAM',
    name: 'Test Vehicle',
    description: 'A test vehicle',
    content: {},
    engineMax: 100,
    engineLoad: 0,
    engineFuel: 100,
    auxMax: 50,
    auxLoad: 0,
    auxFuel: 50,
    speed: 60,
    gameId: mockGameId,
    priceGold: 5000,
    priceGems: 10,
    fuelBaseBurn: 1,
    fuelPerLoadBurn: 0.1,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  });

  beforeEach(async () => {
    const mockVehiclesServiceMethods = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByGameId: jest.fn(),
    };

    const mockVehicleMapperMethods = {
      toDto: jest.fn(),
      toDomain: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiclesController],
      providers: [
        { provide: VehiclesService, useValue: mockVehiclesServiceMethods },
        { provide: VehicleMapper, useValue: mockVehicleMapperMethods },
      ],
    }).compile();

    controller = module.get<VehiclesController>(VehiclesController);
    vehiclesService = module.get(VehiclesService);
    vehicleMapper = module.get(VehicleMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByGameId', () => {
    it('should return vehicles for a game', async () => {
      const mockDto = createMockVehicleDto();
      const mockPage: PageDto<any> = {
        data: [mockDto],
        page: 1,
        limit: 10,
        totalCount: 1,
      };

      vehiclesService.findByGameId.mockResolvedValue(mockPage);
      vehicleMapper.toDto.mockResolvedValue(mockDto);

      const result = await controller.findByGameId(mockGameId, {} as any);

      expect(result.data).toHaveLength(1);
      expect(vehiclesService.findByGameId).toHaveBeenCalledWith(mockGameId, {});
    });

    it('should return empty page when no vehicles found', async () => {
      const mockPage: PageDto<any> = {
        data: [],
        page: 1,
        limit: 10,
        totalCount: 0,
      };

      vehiclesService.findByGameId.mockResolvedValue(mockPage);
      vehicleMapper.toDto.mockResolvedValue(null);

      const result = await controller.findByGameId(mockGameId, {} as any);

      expect(result.data).toHaveLength(0);
    });

    it('should pass pagination parameters to service', async () => {
      const mockPage: PageDto<any> = {
        data: [],
        page: 2,
        limit: 20,
        totalCount: 0,
      };

      vehiclesService.findByGameId.mockResolvedValue(mockPage);

      const pagination = { page: '2', limit: '20' };
      await controller.findByGameId(mockGameId, pagination as any);

      expect(vehiclesService.findByGameId).toHaveBeenCalledWith(mockGameId, pagination);
    });
  });

  describe('standard CRUD endpoints', () => {
    it('should findOne return a vehicle', async () => {
      const mockDto = createMockVehicleDto();
      vehiclesService.findOne.mockResolvedValue(mockDto as any);
      vehicleMapper.toDto.mockResolvedValue(mockDto);

      const result = await controller.findOne(mockVehicleId);

      expect(result).toEqual(mockDto);
      expect(vehiclesService.findOne).toHaveBeenCalledWith(mockVehicleId);
    });

    it('should findAll return paginated vehicles', async () => {
      const mockDto = createMockVehicleDto();
      const mockPage: PageDto<any> = {
        data: [mockDto],
        page: 1,
        limit: 10,
        totalCount: 1,
      };

      vehiclesService.findAll.mockResolvedValue(mockPage);
      vehicleMapper.toDto.mockResolvedValue(mockDto);

      const result = await controller.findAll({} as any);

      expect(result.data).toHaveLength(1);
    });

    it('should create a new vehicle', async () => {
      const mockDto = createMockVehicleDto();
      const createdVehicle = { ...mockDto, id: undefined };

      vehiclesService.create.mockResolvedValue(createdVehicle as any);
      vehicleMapper.toDto.mockResolvedValue(mockDto);
      vehicleMapper.toDomain.mockResolvedValue(createdVehicle as any);

      const result = await controller.create(mockDto, {} as any);

      expect(vehiclesService.create).toHaveBeenCalled();
    });
  });
});