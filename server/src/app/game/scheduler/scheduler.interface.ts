/**
 * Represents a scheduled event in the system.
 * Used internally by the scheduler to track pending tasks.
 */
export interface ISchedulerEvent {
  /** Unique identifier for the scheduled event */
  id: string;
  /** Event name/type (e.g., 'vehicle:arrival', 'job:refresh') - used to route to handlers */
  event: string;
  /** Arbitrary data passed to the event handler when executed */
  payload: any;
  /** When the event is scheduled to be executed */
  executeAt: Date;
}

/**
 * Abstract scheduler service for delayed event execution.
 *
 * This interface allows the game engine to schedule events that fire after
 * a specified delay. The primary use case is vehicle arrivals - when a vehicle
 * is dispatched, we schedule an arrival event to fire when it reaches its
 * destination.
 *
 * The interface is designed to be implementable by different backends:
 * - V1: In-memory setTimeout (does not survive server restart)
 * - Production: Redis-backed Bull queue (survives restarts, supports clustering)
 *
 * Event handlers are registered via the 'on()' method and fired when
 * schedule()'s delay expires.
 */
export interface ISchedulerService {
  /**
   * Schedule an event to fire after a delay.
   * @param event - Event name used to route to registered handlers
   * @param payload - Data to pass to the handler
   * @param delayMs - Delay in milliseconds before execution
   * @returns Unique task ID that can be used to cancel the scheduled event
   */
  schedule(event: string, payload: any, delayMs: number): string;

  /**
   * Cancel a previously scheduled event.
   * @param taskId - The ID returned by schedule()
   * @returns true if the event was found and cancelled, false if it already fired or didn't exist
   */
  cancel(taskId: string): boolean;

  /**
   * Get all currently pending (scheduled but not yet executed) events.
   * @returns Array of ISchedulerEvent objects
   */
  getPending(): ISchedulerEvent[];

  /**
   * Register a handler function for an event type.
   * When schedule() is called with a matching event name, all handlers
   * registered for that event will be called with the payload.
   * @param event - Event name to listen for
   * @param handler - Function to call when the event fires
   */
  on(event: string, handler: (payload: any) => void): void;
}
