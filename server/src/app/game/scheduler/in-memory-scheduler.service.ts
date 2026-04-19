import { Injectable } from '@nestjs/common';
import { ISchedulerEvent, ISchedulerService } from './scheduler.interface';

/**
 * In-memory implementation of the scheduler using setTimeout.
 *
 * This implementation is suitable for V1 development and single-instance
 * deployments. It does NOT survive server restarts - all scheduled events
 * are lost when the process exits.
 *
 * For production multi-instance deployments, replace this with a Redis-backed
 * implementation (e.g., Bull queue) that implements the same ISchedulerService
 * interface.
 *
 * Maps store data by task ID for O(1) lookup during cancel operations.
 */
@Injectable()
export class InMemorySchedulerService implements ISchedulerService {
  /** Maps task ID to NodeJS.Timeout for cancellation */
  private timers: Map<string, NodeJS.Timeout> = new Map();
  /** Maps task ID to event metadata for getPending() queries */
  private events: Map<string, ISchedulerEvent> = new Map();
  /** Maps event name to array of handler functions */
  private handlers: Map<string, Array<(payload: any) => void>> = new Map();

  /**
   * Schedule an event to fire after delayMs milliseconds.
   * When the timeout expires, all handlers registered for the event name
   * are called with the payload.
   *
   * @param event - Event name (e.g., 'vehicle:arrival')
   * @param payload - Data to pass to handlers
   * @param delayMs - Milliseconds to wait before firing
   * @returns UUID that can be used to cancel the event
   */
  schedule(event: string, payload: any, delayMs: number): string {
    const id = crypto.randomUUID();
    const executeAt = new Date(Date.now() + delayMs);

    const schedulerEvent: ISchedulerEvent = {
      id,
      event,
      payload,
      executeAt
    };

    const timer = setTimeout(() => {
      this.timers.delete(id);
      this.events.delete(id);
      this.handlers.get(event)?.forEach(h => h(payload));
    }, delayMs);

    this.timers.set(id, timer);
    this.events.set(id, schedulerEvent);

    return id;
  }

  /**
   * Cancel a pending scheduled event.
   * If the event has already fired, returns false.
   * If the event was never scheduled, returns false.
   *
   * @param taskId - The ID returned by schedule()
   * @returns true if cancelled, false if not found
   */
  cancel(taskId: string): boolean {
    const timer = this.timers.get(taskId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(taskId);
      this.events.delete(taskId);
      return true;
    }
    return false;
  }

  /**
   * Get all scheduled but not-yet-executed events.
   * Useful for debugging and monitoring.
   *
   * @returns Array of pending events
   */
  getPending(): ISchedulerEvent[] {
    return Array.from(this.events.values());
  }

  /**
   * Register a handler to be called when a specific event fires.
   * Multiple handlers can be registered for the same event name.
   * Handlers are called in registration order with the payload from schedule().
   *
   * @param event - Event name to listen for
   * @param handler - Function to call when event fires
   */
  on(event: string, handler: (payload: any) => void): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event).push(handler);
  }
}
