import { Test, TestingModule } from '@nestjs/testing';
import { ObjectId } from 'mongodb';
import { PlacesController, PlaceDto } from './places.module';
import { PlacesService } from './places.module';
import { PlaceMapper } from './places.module';
import { PageDto } from '../../models/page.model';

describe('PlacesController', () => {
  let controller: PlacesController;
  let placesService: jest.Mocked<PlacesService>;
  let placeMapper: jest.Mocked<PlaceMapper>;

  const mockGameId = new ObjectId().toString();
  const mockPlaceId = new ObjectId().toString();

  const createMockPlaceDto = (): PlaceDto => ({
    id: mockPlaceId,
    name: 'Test Place',
    description: 'A test place',
    type: 'STATION',
    lat: 40.7128,
    lng: -74.006,
    gameId: mockGameId,
    priceGold: 1000,
    priceGems: 0,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  });

  beforeEach(async () => {
    const mockPlacesServiceMethods = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByGameId: jest.fn(),
      copyPlaces: jest.fn(),
      deleteAllByGameId: jest.fn(),
    };

    const mockPlaceMapperMethods = {
      toDto: jest.fn(),
      toDomain: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlacesController],
      providers: [
        { provide: PlacesService, useValue: mockPlacesServiceMethods },
        { provide: PlaceMapper, useValue: mockPlaceMapperMethods },
      ],
    }).compile();

    controller = module.get<PlacesController>(PlacesController);
    placesService = module.get(PlacesService);
    placeMapper = module.get(PlaceMapper);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByGameId', () => {
    it('should return places for a game', async () => {
      const mockDto = createMockPlaceDto();
      const mockPage: PageDto<any> = {
        data: [mockDto],
        page: 1,
        limit: 10,
        totalCount: 1,
      };

      placesService.findByGameId.mockResolvedValue(mockPage);
      placeMapper.toDto.mockResolvedValue(mockDto);

      const result = await controller.findByGameId(mockGameId, {} as any);

      expect(result.data).toHaveLength(1);
      expect(placesService.findByGameId).toHaveBeenCalledWith(mockGameId, {});
    });

    it('should return empty page when no places found', async () => {
      const mockPage: PageDto<any> = {
        data: [],
        page: 1,
        limit: 10,
        totalCount: 0,
      };

      placesService.findByGameId.mockResolvedValue(mockPage);
      placeMapper.toDto.mockResolvedValue(null);

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

      placesService.findByGameId.mockResolvedValue(mockPage);

      const pagination = { page: '2', limit: '20' };
      await controller.findByGameId(mockGameId, pagination as any);

      expect(placesService.findByGameId).toHaveBeenCalledWith(mockGameId, pagination);
    });
  });

  describe('copyPlaces', () => {
    it('should copy places from source to target game', async () => {
      const copyResult = {
        copiedCount: 5,
        skippedCount: 2,
        overwrittenCount: 0,
        errorCount: 0,
      };

      placesService.copyPlaces.mockResolvedValue(copyResult);

      const result = await controller.copyPlaces({
        sourceGameId: mockGameId,
        targetGameId: new ObjectId().toString(),
        overwrite: false,
      });

      expect(result.copiedCount).toBe(5);
      expect(placesService.copyPlaces).toHaveBeenCalled();
    });

    it('should handle overwrite option', async () => {
      const copyResult = {
        copiedCount: 3,
        skippedCount: 0,
        overwrittenCount: 2,
        errorCount: 0,
      };

      placesService.copyPlaces.mockResolvedValue(copyResult);

      const result = await controller.copyPlaces({
        sourceGameId: mockGameId,
        targetGameId: new ObjectId().toString(),
        overwrite: true,
      });

      expect(result.overwrittenCount).toBe(2);
    });
  });

  describe('deleteAllByGameId', () => {
    it('should delete all places for a game', async () => {
      placesService.deleteAllByGameId.mockResolvedValue(5);

      const result = await controller.deleteAllByGameId(mockGameId);

      expect(result.deletedCount).toBe(5);
      expect(placesService.deleteAllByGameId).toHaveBeenCalledWith(mockGameId);
    });

    it('should return 0 when no places deleted', async () => {
      placesService.deleteAllByGameId.mockResolvedValue(0);

      const result = await controller.deleteAllByGameId(mockGameId);

      expect(result.deletedCount).toBe(0);
    });
  });
});
