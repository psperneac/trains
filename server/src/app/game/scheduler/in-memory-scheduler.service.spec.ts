import { Test, TestingModule } from '@nestjs/testing';
import { InMemorySchedulerService } from './in-memory-scheduler.service';
import { ISchedulerEvent } from './scheduler.interface';

describe('InMemorySchedulerService', () => {
  let service: InMemorySchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InMemorySchedulerService]
    }).compile();

    service = module.get<InMemorySchedulerService>(InMemorySchedulerService);
  });

  afterEach(() => {
    // Clean up any pending timers
    const pending = service.getPending();
    pending.forEach(event => service.cancel(event.id));
  });

  describe('schedule', () => {
    it('should return a UUID string', () => {
      const taskId = service.schedule('test:event', {}, 1000);
      expect(typeof taskId).toBe('string');
      expect(taskId.length).toBe(36); // UUID format
    });

    it('should add event to pending list', () => {
      const taskId = service.schedule('test:event', { data: 123 }, 1000);
      const pending = service.getPending();
      expect(pending).toHaveLength(1);
      expect(pending[0].id).toBe(taskId);
      expect(pending[0].event).toBe('test:event');
      expect(pending[0].payload).toEqual({ data: 123 });
    });

    it('should execute handler after delay', async () => {
      const handler = jest.fn();
      service.on('test:event', handler);

      service.schedule('test:event', { value: 'test' }, 50);

      expect(handler).not.toHaveBeenCalled();
      await new Promise(resolve => setTimeout(resolve, 60));
      expect(handler).toHaveBeenCalledWith({ value: 'test' });
    });

    it('should remove event from pending after execution', async () => {
      const taskId = service.schedule('test:event', {}, 50);
      expect(service.getPending()).toHaveLength(1);

      await new Promise(resolve => setTimeout(resolve, 60));
      expect(service.getPending()).toHaveLength(0);
    });
  });

  describe('cancel', () => {
    it('should return true when cancelling existing event', () => {
      const taskId = service.schedule('test:event', {}, 1000);
      expect(service.cancel(taskId)).toBe(true);
    });

    it('should return false when event already executed', async () => {
      const taskId = service.schedule('test:event', {}, 50);
      await new Promise(resolve => setTimeout(resolve, 60));
      expect(service.cancel(taskId)).toBe(false);
    });

    it('should return false for non-existent ID', () => {
      expect(service.cancel('non-existent-id')).toBe(false);
    });

    it('should remove event from pending after cancel', () => {
      const taskId = service.schedule('test:event', {}, 1000);
      expect(service.getPending()).toHaveLength(1);
      service.cancel(taskId);
      expect(service.getPending()).toHaveLength(0);
    });

    it('should prevent handler from firing after cancel', async () => {
      const handler = jest.fn();
      service.on('test:event', handler);

      const taskId = service.schedule('test:event', {}, 50);
      service.cancel(taskId);

      await new Promise(resolve => setTimeout(resolve, 60));
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('getPending', () => {
    it('should return empty array initially', () => {
      expect(service.getPending()).toEqual([]);
    });

    it('should return all pending events', () => {
      service.schedule('event:1', {}, 1000);
      service.schedule('event:2', {}, 1000);
      expect(service.getPending()).toHaveLength(2);
    });

    it('should include event metadata', () => {
      const before = Date.now();
      service.schedule('test:event', { data: 'value' }, 1000);
      const after = Date.now();

      const pending = service.getPending();
      expect(pending).toHaveLength(1);
      expect(pending[0].event).toBe('test:event');
      expect(pending[0].payload).toEqual({ data: 'value' });
      expect(pending[0].executeAt.getTime()).toBeGreaterThanOrEqual(before + 1000);
      expect(pending[0].executeAt.getTime()).toBeLessThanOrEqual(after + 1000);
    });
  });

  describe('on', () => {
    it('should register handler for event', () => {
      const handler = jest.fn();
      service.on('test:event', handler);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should call handler when event fires', async () => {
      const handler = jest.fn();
      service.on('test:event', handler);

      service.schedule('test:event', { value: 1 }, 50);
      await new Promise(resolve => setTimeout(resolve, 60));
      expect(handler).toHaveBeenCalledWith({ value: 1 });
    });

    it('should support multiple handlers for same event', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      service.on('test:event', handler1);
      service.on('test:event', handler2);

      service.schedule('test:event', {}, 50);
      await new Promise(resolve => setTimeout(resolve, 60));

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should call handlers in registration order', async () => {
      const callOrder: number[] = [];
      service.on('test:event', () => callOrder.push(1));
      service.on('test:event', () => callOrder.push(2));

      service.schedule('test:event', {}, 50);
      await new Promise(resolve => setTimeout(resolve, 60));

      expect(callOrder).toEqual([1, 2]);
    });

    it('should not affect handlers for different events', async () => {
      const handlerA = jest.fn();
      const handlerB = jest.fn();
      service.on('event:A', handlerA);
      service.on('event:B', handlerB);

      service.schedule('event:A', {}, 50);
      await new Promise(resolve => setTimeout(resolve, 60));

      expect(handlerA).toHaveBeenCalled();
      expect(handlerB).not.toHaveBeenCalled();
    });
  });

  describe('integration', () => {
    it('should handle multiple sequential events', async () => {
      const results: string[] = [];
      service.on('job', (payload: any) => results.push(payload.id));

      service.schedule('job', { id: 'first' }, 30);
      service.schedule('job', { id: 'second' }, 60);
      service.schedule('job', { id: 'third' }, 90);

      await new Promise(resolve => setTimeout(resolve, 120));
      expect(results).toEqual(['first', 'second', 'third']);
    });

    it('should handle vehicle arrival scenario', async () => {
      const arrivals: string[] = [];
      service.on('vehicle:arrival', (payload: any) => arrivals.push(payload.vehicleId));

      // Vehicle 1 arrives at 50ms
      service.schedule('vehicle:arrival', { vehicleId: 'v1', destination: 'placeA' }, 50);
      // Vehicle 2 arrives at 100ms
      service.schedule('vehicle:arrival', { vehicleId: 'v2', destination: 'placeB' }, 100);

      await new Promise(resolve => setTimeout(resolve, 120));
      expect(arrivals).toEqual(['v1', 'v2']);
    });
  });
});
