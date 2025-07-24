import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DomainEvent,
  IEventBus,
  EventHandlerOptions,
} from './interfaces/domain-event.interface';

@Injectable()
export class EventBusService implements IEventBus {
  private readonly logger = new Logger(EventBusService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async emit<T = any>(event: DomainEvent<T>): Promise<void> {
    try {
      this.logger.debug(`Emitting event: ${event.eventType}`, {
        eventId: event.eventId,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        correlationId: event.metadata.correlationId,
      });

      // Emit the specific event type ONLY
      await this.eventEmitter.emitAsync(event.eventType, event);

      // REMOVED: Wildcard emissions causing event routing chaos
      // These were causing MessageSentEvent to trigger ALL event handlers
      // await this.eventEmitter.emitAsync('*', event);
      // await this.eventEmitter.emitAsync(`${event.aggregateType}.*`, event);

      this.logger.debug(`Event emitted successfully: ${event.eventType}`);
    } catch (error) {
      this.logger.error(`Failed to emit event: ${event.eventType}`, {
        eventId: event.eventId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  subscribe<T = any>(
    eventType: string,
    handler: (event: DomainEvent<T>) => Promise<void>,
    options: EventHandlerOptions = {},
  ): void {
    this.logger.debug(`Subscribing to event: ${eventType}`, {
      handlerName: handler.name,
      options,
    });

    const wrappedHandler = async (event: DomainEvent<T>) => {
      try {
        this.logger.debug(`Handling event: ${event.eventType}`, {
          eventId: event.eventId,
          handlerName: handler.name,
        });

        await handler(event);

        this.logger.debug(`Event handled successfully: ${event.eventType}`, {
          eventId: event.eventId,
          handlerName: handler.name,
        });
      } catch (error) {
        this.logger.error(`Event handler failed: ${event.eventType}`, {
          eventId: event.eventId,
          handlerName: handler.name,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });

        // Re-throw to allow EventEmitter2 to handle retry logic
        throw error;
      }
    };

    if (options.async !== false) {
      this.eventEmitter.on(eventType, (event: DomainEvent<T>) => {
        void wrappedHandler(event);
      });
    } else {
      // For synchronous handlers, we still use async but without await
      this.eventEmitter.on(eventType, (event: DomainEvent<T>) => {
        void wrappedHandler(event).catch((error) => {
          this.logger.error(
            `Async event handler error: ${event.eventType}`,
            error,
          );
        });
      });
    }
  }

  unsubscribe(eventType: string, handler: (...args: any[]) => any): void {
    this.logger.debug(`Unsubscribing from event: ${eventType}`, {
      handlerName: handler.name,
    });

    this.eventEmitter.off(eventType, handler);
  }

  // Additional utility methods

  /**
   * Subscribe to all events of a specific aggregate type
   */
  subscribeToAggregate<T = any>(
    aggregateType: string,
    handler: (event: DomainEvent<T>) => Promise<void>,
    options: EventHandlerOptions = {},
  ): void {
    const eventPattern = `${aggregateType}.*`;
    this.subscribe(eventPattern, handler, options);
  }

  /**
   * Subscribe to all events (wildcard subscription)
   */
  subscribeToAll<T = any>(
    handler: (event: DomainEvent<T>) => Promise<void>,
    options: EventHandlerOptions = {},
  ): void {
    this.subscribe('*', handler, options);
  }

  /**
   * Get event statistics
   */
  getEventStats(): {
    totalListeners: number;
    eventTypes: string[];
  } {
    const eventNames = this.eventEmitter.eventNames();
    return {
      totalListeners: eventNames.reduce(
        (total, eventName) =>
          total + this.eventEmitter.listenerCount(eventName),
        0,
      ),
      eventTypes: eventNames as string[],
    };
  }

  /**
   * Check if there are listeners for a specific event type
   */
  hasListeners(eventType: string): boolean {
    return this.eventEmitter.listenerCount(eventType) > 0;
  }

  /**
   * Remove all listeners for a specific event type
   */
  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.logger.debug(`Removing all listeners for event: ${eventType}`);
      this.eventEmitter.removeAllListeners(eventType);
    } else {
      this.logger.debug('Removing all event listeners');
      this.eventEmitter.removeAllListeners();
    }
  }
}
