import { Test, TestingModule } from '@nestjs/testing';
import { ObjectId } from 'mongodb';
import { PlaceConnectionController, PlaceConnectionDto } from './place-connection.module';
import { PlaceConnectionsService } from './place-connection.module';
import { PlaceConnectionMapper } from './place-connection.module';
import { PageDto } from '../../models/page.model';

describe('PlaceConnectionController', () => {
  let controller: PlaceConnectionController;
  let connectionsService: jest.Mocked<PlaceConnectionsService>;
  let connectionMapper: jest.Mocked<PlaceConnectionMapper>;

  const mockGameId = new ObjectId().toString();
  const mockConnectionId = new ObjectId().toString();

  const createMockConnectionDto = (): PlaceConnectionDto => ({
    id: mockConnectionId,
    type: 'ROAD',
    name: 'Test Connection',
    description: 'A test connection',
    content: {},
    startId: new ObjectId().toString(),
    endId: new ObjectId().toString(),
    gameId: mockGameId,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  });

  beforeEach(async () => {
    const mockConnectionsServiceMethods = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByGameId: jest.fn(),
      copyPlaceConnections: jest.fn(),
      deleteAllByGameId: jest.fn(),
    };

    const mockConnectionMapperMethods = {
      toDto: jest.fn(),
      toDomain: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaceConnectionController],
      providers: [
        { provide: PlaceConnectionsService, useValue: mockConnectionsServiceMethods },
        { provide: PlaceConnectionMapper, useValue: mockConnectionMapperMethods },
      ],
    }).compile();

    controller = module.get<PlaceConnectionController>(PlaceConnectionController);
    connectionsService = module.get(PlaceConnectionsService);
    connectionMapper = module.get(PlaceConnectionMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByGameId', () => {
    it('should return connections for a game', async () => {
      const mockDto = createMockConnectionDto();
      const mockPage: PageDto<any> = {
        data: [mockDto],
        page: 1,
        limit: 10,
        totalCount: 1,
      };

      connectionsService.findByGameId.mockResolvedValue(mockPage);
      connectionMapper.toDto.mockResolvedValue(mockDto);

      const result = await controller.findByGameId(mockGameId, {} as any);

      expect(result.data).toHaveLength(1);
      expect(connectionsService.findByGameId).toHaveBeenCalledWith(mockGameId, {});
    });

    it('should return empty page when no connections found', async () => {
      const mockPage: PageDto<any> = {
        data: [],
        page: 1,
        limit: 10,
        totalCount: 0,
      };

      connectionsService.findByGameId.mockResolvedValue(mockPage);
      connectionMapper.toDto.mockResolvedValue(null);

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

      connectionsService.findByGameId.mockResolvedValue(mockPage);

      const pagination = { page: '2', limit: '20' };
      await controller.findByGameId(mockGameId, pagination as any);

      expect(connectionsService.findByGameId).toHaveBeenCalledWith(mockGameId, pagination);
    });
  });

  describe('copyPlaceConnections', () => {
    it('should copy connections from source to target game', async () => {
      const copyResult = {
        copiedCount: 5,
        skippedCount: 2,
        overwrittenCount: 0,
        errorCount: 0,
      };

      connectionsService.copyPlaceConnections.mockResolvedValue(copyResult);

      const result = await controller.copyPlaceConnections({
        sourceGameId: mockGameId,
        targetGameId: new ObjectId().toString(),
        overwrite: false,
      });

      expect(result.copiedCount).toBe(5);
      expect(connectionsService.copyPlaceConnections).toHaveBeenCalled();
    });

    it('should handle overwrite option', async () => {
      const copyResult = {
        copiedCount: 3,
        skippedCount: 0,
        overwrittenCount: 2,
        errorCount: 0,
      };

      connectionsService.copyPlaceConnections.mockResolvedValue(copyResult);

      const result = await controller.copyPlaceConnections({
        sourceGameId: mockGameId,
        targetGameId: new ObjectId().toString(),
        overwrite: true,
      });

      expect(result.overwrittenCount).toBe(2);
    });
  });

  describe('deleteAllByGameId', () => {
    it('should delete all connections for a game', async () => {
      connectionsService.deleteAllByGameId.mockResolvedValue(5);

      const result = await controller.deleteAllByGameId(mockGameId);

      expect(result.deletedCount).toBe(5);
      expect(connectionsService.deleteAllByGameId).toHaveBeenCalledWith(mockGameId);
    });

    it('should return 0 when no connections deleted', async () => {
      connectionsService.deleteAllByGameId.mockResolvedValue(0);

      const result = await controller.deleteAllByGameId(mockGameId);

      expect(result.deletedCount).toBe(0);
    });
  });
});
