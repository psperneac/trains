import { Test, TestingModule } from '@nestjs/testing';
import { GameClockService, GameTimeSync } from './game-clock.service';

describe('GameClockService', () => {
  let service: GameClockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameClockService]
    }).compile();

    service = module.get<GameClockService>(GameClockService);
  });

  describe('getGameTime', () => {
    it('should return 0 when not synchronized', () => {
      expect(service.getGameTime()).toBe(0);
    });

    it('should return elapsed time after sync', async () => {
      service.syncWithWallClock();
      await new Promise(resolve => setTimeout(resolve, 50));
      const gameTime = service.getGameTime();
      expect(gameTime).toBeGreaterThanOrEqual(45);
      expect(gameTime).toBeLessThan(200);
    });

    it('should accumulate time across multiple calls', async () => {
      service.syncWithWallClock();
      await new Promise(resolve => setTimeout(resolve, 30));
      const first = service.getGameTime();
      await new Promise(resolve => setTimeout(resolve, 30));
      const second = service.getGameTime();
      expect(second).toBeGreaterThan(first);
    });
  });

  describe('syncWithWallClock', () => {
    it('should return sync info with game time and timestamp', () => {
      const sync = service.syncWithWallClock();
      expect(sync).toHaveProperty('gameTime');
      expect(sync).toHaveProperty('timestamp');
      expect(sync.timestamp).toBeInstanceOf(Date);
    });

    it('should set isReady to true', () => {
      expect(service.isReady()).toBe(false);
      service.syncWithWallClock();
      expect(service.isReady()).toBe(true);
    });

    it('should preserve previously accumulated time', async () => {
      service.syncWithWallClock();
      await new Promise(resolve => setTimeout(resolve, 50));
      const firstSync = service.getGameTime();

      const syncResult = service.syncWithWallClock();
      expect(syncResult.gameTime).toBeGreaterThanOrEqual(firstSync);
      expect(syncResult.gameTime).toBeLessThan(firstSync + 20);
    });
  });

  describe('getSyncInfo', () => {
    it('should return sync information', () => {
      service.syncWithWallClock();
      const info = service.getSyncInfo();
      expect(info).toHaveProperty('gameTime');
      expect(info).toHaveProperty('drift');
      expect(info).toHaveProperty('timestamp');
    });

    it('should reflect elapsed time', async () => {
      service.syncWithWallClock();
      await new Promise(resolve => setTimeout(resolve, 40));
      const info = service.getSyncInfo();
      expect(info.gameTime).toBeGreaterThanOrEqual(35);
    });
  });

  describe('isReady', () => {
    it('should return false before first sync', () => {
      expect(service.isReady()).toBe(false);
    });

    it('should return true after sync', () => {
      service.syncWithWallClock();
      expect(service.isReady()).toBe(true);
    });
  });

  describe('timing accuracy', () => {
    it('should track time accurately over short delays', async () => {
      service.syncWithWallClock();
      const before = Date.now();

      await new Promise(resolve => setTimeout(resolve, 100));

      const gameTime = service.getGameTime();
      const wallElapsed = Date.now() - before;

      expect(gameTime).toBeGreaterThanOrEqual(90);
      expect(gameTime).toBeLessThan(wallElapsed + 20);
    });

    it('should handle rapid successive sync calls', () => {
      service.syncWithWallClock();
      const sync1 = service.syncWithWallClock();
      const sync2 = service.syncWithWallClock();
      const sync3 = service.syncWithWallClock();

      expect(sync3.gameTime).toBeGreaterThanOrEqual(sync2.gameTime);
      expect(sync2.gameTime).toBeGreaterThanOrEqual(sync1.gameTime);
    });
  });

  describe('game time progression', () => {
    it('should show increasing game time', async () => {
      service.syncWithWallClock();

      const times: number[] = [];
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 20));
        times.push(service.getGameTime());
      }

      for (let i = 1; i < times.length; i++) {
        expect(times[i]).toBeGreaterThan(times[i - 1]);
      }
    });
  });
});