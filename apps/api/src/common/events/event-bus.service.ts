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
      this.logger.log(`🚀 [EVENT BUS] ========== EMIT CALLED ==========`);
      this.logger.log(`🚀 [EVENT BUS] Event type: ${event.eventType}`);
      this.logger.log(`🚀 [EVENT BUS] Event ID: ${event.eventId}`);
      this.logger.debug(`Emitting event: ${event.eventType}`, {
        eventId: event.eventId,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        correlationId: event.metadata.correlationId,
      });

      // Check if there are listeners for this event
      const listenerCount = this.eventEmitter.listenerCount(event.eventType);
      this.logger.log(`📡 [EVENT DELIVERY] Event ${event.eventType} has ${listenerCount} listeners`);
      
      if (listenerCount === 0) {
        this.logger.error(`❌ [EVENT DELIVERY] No listeners registered for event: ${event.eventType}`);
        this.logger.error(`❌ [EVENT DELIVERY] This event will NOT be handled!`);
        const availableEvents = Array.from(this.eventEmitter.eventNames());
        this.logger.error(`❌ [EVENT DELIVERY] Available event types with listeners: ${availableEvents.length > 0 ? availableEvents.join(', ') : 'NONE'}`);
      }

      // Special logging for MessageSentEvent
      if (event.eventType === 'MessageSentEvent') {
        this.logger.log(`🚨 [MESSAGE EVENT] ========== Emitting MessageSentEvent ==========`);
        this.logger.log(`🚨 [MESSAGE EVENT] Emitting MessageSentEvent to ${listenerCount} listeners`);
        this.logger.log(`🚨 [MESSAGE EVENT] Event ID: ${event.eventId}`);
        this.logger.log(`🚨 [MESSAGE EVENT] Conversation ID: ${(event.eventData as any)?.conversationId || 'NOT FOUND'}`);
        this.logger.log(`🚨 [MESSAGE EVENT] Message ID: ${(event.eventData as any)?.messageId || 'NOT FOUND'}`);
        this.logger.debug(`🚨 [MESSAGE EVENT] Event data:`, event.eventData);
      }

      // Emit the specific event type ONLY
      this.logger.log(`📤 [EVENT BUS] About to call eventEmitter.emitAsync('${event.eventType}', event)`);
      
      // Log all registered listeners before emitting
      if (event.eventType === 'MessageSentEvent') {
        const listeners = this.eventEmitter.listeners(event.eventType);
        this.logger.log(`📋 [EVENT BUS] Registered listeners for MessageSentEvent: ${listeners.length}`);
        listeners.forEach((listener, index) => {
          this.logger.log(`📋 [EVENT BUS] Listener ${index + 1}: ${listener.name || 'anonymous'} (type: ${typeof listener})`);
        });
      }
      
      const emitResult = await this.eventEmitter.emitAsync(event.eventType, event);
      this.logger.log(`📤 [EVENT BUS] emitAsync completed. Result: ${Array.isArray(emitResult) ? emitResult.length + ' handlers executed' : 'unknown'}`);
      
      // Log which handlers actually executed
      if (event.eventType === 'MessageSentEvent' && Array.isArray(emitResult)) {
        this.logger.log(`📋 [EVENT BUS] Handler execution results: ${emitResult.map((r, i) => `Handler ${i + 1}: ${r === undefined ? 'undefined' : typeof r}`).join(', ')}`);
      }

      // REMOVED: Wildcard emissions causing event routing chaos
      // These were causing MessageSentEvent to trigger ALL event handlers
      // await this.eventEmitter.emitAsync('*', event);
      // await this.eventEmitter.emitAsync(`${event.aggregateType}.*`, event);

      this.logger.debug(`Event emitted successfully: ${event.eventType}`);
      
      // Special confirmation for MessageSentEvent
      if (event.eventType === 'MessageSentEvent') {
        this.logger.log(`✅ [MESSAGE EVENT] MessageSentEvent emission completed`);
        this.logger.log(`✅ [MESSAGE EVENT] Handlers executed: ${Array.isArray(emitResult) ? emitResult.length : 'unknown'}`);
        if (Array.isArray(emitResult) && emitResult.length === 0) {
          this.logger.error(`❌ [MESSAGE EVENT] NO HANDLERS EXECUTED! This means the subscription isn't working!`);
        }
      }
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

    // Special logging for MessageSentEvent subscription
    if (eventType === 'MessageSentEvent') {
      this.logger.log(`🔔 [EVENT SUBSCRIPTION] MessageSentEvent handler registered! Handler: ${handler.name || 'anonymous'}`);
      this.logger.log(`🔔 [EVENT SUBSCRIPTION] Total listeners for MessageSentEvent BEFORE registration: ${this.eventEmitter.listenerCount(eventType)}`);
    }

    const wrappedHandler = async (event: DomainEvent<T>) => {
      try {
        // Special logging for MessageSentEvent handling - BEFORE handler execution
        if (event.eventType === 'MessageSentEvent') {
          this.logger.log(`🎯 [EVENT BUS WRAPPER] MessageSentEvent being handled by ${handler.name || 'anonymous'}`);
          this.logger.log(`🎯 [EVENT BUS WRAPPER] About to call handler function...`);
        }
        
        this.logger.debug(`Handling event: ${event.eventType}`, {
          eventId: event.eventId,
          handlerName: handler.name,
        });

        await handler(event);
        
        // Special logging for MessageSentEvent handling - AFTER handler execution
        if (event.eventType === 'MessageSentEvent') {
          this.logger.log(`✅ [EVENT BUS WRAPPER] Handler ${handler.name || 'anonymous'} completed successfully`);
        }

        this.logger.debug(`Event handled successfully: ${event.eventType}`, {
          eventId: event.eventId,
          handlerName: handler.name,
        });
        
        // Special confirmation for MessageSentEvent handling
        if (event.eventType === 'MessageSentEvent') {
          this.logger.log(`✅ [EVENT HANDLER] MessageSentEvent handled successfully by ${handler.name || 'anonymous'}`);
        }
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
    
    // Special logging for MessageSentEvent subscription - AFTER registration
    if (eventType === 'MessageSentEvent') {
      const listenerCountAfter = this.eventEmitter.listenerCount(eventType);
      this.logger.log(`🔔 [EVENT SUBSCRIPTION] Total listeners for MessageSentEvent AFTER registration: ${listenerCountAfter}`);
      if (listenerCountAfter === 0) {
        this.logger.error(`❌ [EVENT SUBSCRIPTION] CRITICAL: Listener was NOT added to EventEmitter2!`);
        this.logger.error(`❌ [EVENT SUBSCRIPTION] EventEmitter2.on() was called but listenerCount is still 0!`);
        this.logger.error(`❌ [EVENT SUBSCRIPTION] This means the subscription is NOT working!`);
      } else {
        this.logger.log(`✅ [EVENT SUBSCRIPTION] Listener successfully registered! Total: ${listenerCountAfter}`);
      }
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
