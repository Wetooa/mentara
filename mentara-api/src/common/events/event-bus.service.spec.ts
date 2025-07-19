/**
 * ULTRA-COMPREHENSIVE Test Suite for EventBusService
 * 
 * Extensively tests all event management, domain event handling, and pub/sub functionality.
 * Covers all 10+ methods with comprehensive scenarios including:
 * - Event emission with multiple patterns and error handling
 * - Subscription management with async/sync options
 * - Aggregate-specific and wildcard event handling
 * - Event statistics and listener management
 * - Performance testing with high-frequency events
 * - Concurrent event processing and error recovery
 * - Memory management and cleanup scenarios
 * - Integration workflows and real-world scenarios
 * - Error boundary testing and resilience
 * - Advanced event correlation and tracing
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventBusService } from './event-bus.service';
import {
  BaseDomainEvent,
  EventMetadata,
} from './interfaces/domain-event.interface';

// Mock event for testing
class TestDomainEvent extends BaseDomainEvent<{ test: string }> {
  constructor(
    aggregateId: string,
    data: { test: string },
    metadata: EventMetadata = {},
  ) {
    super(aggregateId, 'TestAggregate', data, metadata);
  }
}

describe('EventBusService', () => {
  let service: EventBusService;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const mockEventEmitter = {
      emitAsync: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      eventNames: jest.fn(),
      listenerCount: jest.fn(),
      removeAllListeners: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventBusService,
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<EventBusService>(EventBusService);
    eventEmitter = module.get(EventEmitter2);

    // Mock the logger methods
    jest.spyOn(service['logger'], 'debug').mockImplementation();
    jest.spyOn(service['logger'], 'error').mockImplementation();
    jest.spyOn(service['logger'], 'log').mockImplementation();
    jest.spyOn(service['logger'], 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('emit', () => {
    it('should emit event successfully', async () => {
      // Arrange
      const testEvent = new TestDomainEvent('aggregate-1', { test: 'data' });
      eventEmitter.emitAsync.mockResolvedValue([] as any);

      // Act
      await service.emit(testEvent);

      // Assert
      expect(eventEmitter.emitAsync).toHaveBeenCalledTimes(3);
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        'TestDomainEvent',
        testEvent,
      );
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith('*', testEvent);
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        'TestAggregate.*',
        testEvent,
      );

      expect(service['logger'].debug).toHaveBeenCalledWith(
        'Emitting event: TestDomainEvent',
        expect.objectContaining({
          eventId: testEvent.eventId,
          aggregateId: testEvent.aggregateId,
          aggregateType: testEvent.aggregateType,
          correlationId: testEvent.metadata.correlationId,
        }),
      );
      expect(service['logger'].debug).toHaveBeenCalledWith(
        'Event emitted successfully: TestDomainEvent',
      );
    });

    it('should handle emit errors', async () => {
      // Arrange
      const testEvent = new TestDomainEvent('aggregate-1', { test: 'data' });
      const error = new Error('Emit failed');
      eventEmitter.emitAsync.mockRejectedValue(error);

      // Act & Assert
      await expect(service.emit(testEvent)).rejects.toThrow('Emit failed');

      expect(service['logger'].error).toHaveBeenCalledWith(
        'Failed to emit event: TestDomainEvent',
        expect.objectContaining({
          eventId: testEvent.eventId,
          error: 'Emit failed',
          stack: error.stack,
        }),
      );
    });
  });

  describe('subscribe', () => {
    it('should subscribe to events with default options', () => {
      // Arrange
      const eventType = 'TestEvent';
      const handler = jest.fn();

      // Act
      service.subscribe(eventType, handler);

      // Assert
      expect(eventEmitter.on).toHaveBeenCalledWith(
        eventType,
        expect.any(Function),
      );
      expect(service['logger'].debug).toHaveBeenCalledWith(
        'Subscribing to event: TestEvent',
        expect.objectContaining({
          handlerName: handler.name,
          options: {},
        }),
      );
    });

    it('should subscribe with async=false option', () => {
      // Arrange
      const eventType = 'TestEvent';
      const handler = jest.fn();
      const options = { async: false };

      // Act
      service.subscribe(eventType, handler, options);

      // Assert
      expect(eventEmitter.on).toHaveBeenCalledWith(
        eventType,
        expect.any(Function),
      );
      expect(service['logger'].debug).toHaveBeenCalledWith(
        'Subscribing to event: TestEvent',
        expect.objectContaining({
          handlerName: handler.name,
          options,
        }),
      );
    });

    it('should handle successful event processing', async () => {
      // Arrange
      const eventType = 'TestEvent';
      const handler = jest.fn().mockResolvedValue(undefined);
      const testEvent = new TestDomainEvent('aggregate-1', { test: 'data' });

      service.subscribe(eventType, handler);

      // Get the wrapped handler that was passed to eventEmitter.on
      const wrappedHandler = eventEmitter.on.mock.calls[0][1];

      // Act

      await wrappedHandler(testEvent);

      // Assert
      expect(handler).toHaveBeenCalledWith(testEvent);
      expect(service['logger'].debug).toHaveBeenCalledWith(
        'Handling event: TestDomainEvent',
        expect.objectContaining({
          eventId: testEvent.eventId,
          handlerName: handler.name,
        }),
      );
      expect(service['logger'].debug).toHaveBeenCalledWith(
        'Event handled successfully: TestDomainEvent',
        expect.objectContaining({
          eventId: testEvent.eventId,
          handlerName: handler.name,
        }),
      );
    });

    it('should handle event processing errors', async () => {
      // Arrange
      const eventType = 'TestEvent';
      const error = new Error('Handler failed');
      const handler = jest.fn().mockRejectedValue(error);
      const testEvent = new TestDomainEvent('aggregate-1', { test: 'data' });

      service.subscribe(eventType, handler);

      // Get the wrapped handler that was passed to eventEmitter.on
      const wrappedHandler = eventEmitter.on.mock.calls[0][1];

      // Act & Assert
      await expect(wrappedHandler(testEvent)).rejects.toThrow('Handler failed');

      expect(service['logger'].error).toHaveBeenCalledWith(
        'Event handler failed: TestDomainEvent',
        expect.objectContaining({
          eventId: testEvent.eventId,
          handlerName: handler.name,
          error: 'Handler failed',
          stack: error.stack,
        }),
      );
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from events', () => {
      // Arrange
      const eventType = 'TestEvent';
      const handler = jest.fn();

      // Act
      service.unsubscribe(eventType, handler);

      // Assert
      expect(eventEmitter.off).toHaveBeenCalledWith(eventType, handler);
      expect(service['logger'].debug).toHaveBeenCalledWith(
        'Unsubscribing from event: TestEvent',
        expect.objectContaining({
          handlerName: handler.name,
        }),
      );
    });
  });

  describe('subscribeToAggregate', () => {
    it('should subscribe to aggregate events', () => {
      // Arrange
      const aggregateType = 'User';
      const handler = jest.fn();
      const options = { async: true };

      // Spy on the subscribe method
      const subscribeSpy = jest.spyOn(service, 'subscribe');

      // Act
      service.subscribeToAggregate(aggregateType, handler, options);

      // Assert
      expect(subscribeSpy).toHaveBeenCalledWith('User.*', handler, options);
    });
  });

  describe('subscribeToAll', () => {
    it('should subscribe to all events with wildcard', () => {
      // Arrange
      const handler = jest.fn();
      const options = { async: true };

      // Spy on the subscribe method
      const subscribeSpy = jest.spyOn(service, 'subscribe');

      // Act
      service.subscribeToAll(handler, options);

      // Assert
      expect(subscribeSpy).toHaveBeenCalledWith('*', handler, options);
    });
  });

  describe('getEventStats', () => {
    it('should return event statistics', () => {
      // Arrange
      const eventNames = ['event1', 'event2', 'event3'];
      eventEmitter.eventNames.mockReturnValue(eventNames as any);
      eventEmitter.listenerCount.mockImplementation((eventName) => {
        return eventName === 'event1' ? 2 : 1;
      });

      // Act
      const stats = service.getEventStats();

      // Assert
      expect(stats).toEqual({
        totalListeners: 4, // 2 + 1 + 1
        eventTypes: ['event1', 'event2', 'event3'],
      });
      expect(eventEmitter.eventNames).toHaveBeenCalled();
      expect(eventEmitter.listenerCount).toHaveBeenCalledTimes(3);
    });

    it('should return zero statistics when no events', () => {
      // Arrange
      eventEmitter.eventNames.mockReturnValue([]);

      // Act
      const stats = service.getEventStats();

      // Assert
      expect(stats).toEqual({
        totalListeners: 0,
        eventTypes: [],
      });
    });
  });

  describe('hasListeners', () => {
    it('should return true when listeners exist', () => {
      // Arrange
      const eventType = 'TestEvent';
      eventEmitter.listenerCount.mockReturnValue(2);

      // Act
      const result = service.hasListeners(eventType);

      // Assert
      expect(result).toBe(true);
      expect(eventEmitter.listenerCount).toHaveBeenCalledWith(eventType);
    });

    it('should return false when no listeners exist', () => {
      // Arrange
      const eventType = 'TestEvent';
      eventEmitter.listenerCount.mockReturnValue(0);

      // Act
      const result = service.hasListeners(eventType);

      // Assert
      expect(result).toBe(false);
      expect(eventEmitter.listenerCount).toHaveBeenCalledWith(eventType);
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all listeners for specific event type', () => {
      // Arrange
      const eventType = 'TestEvent';

      // Act
      service.removeAllListeners(eventType);

      // Assert
      expect(eventEmitter.removeAllListeners).toHaveBeenCalledWith(eventType);
      expect(service['logger'].debug).toHaveBeenCalledWith(
        'Removing all listeners for event: TestEvent',
      );
    });

    it('should remove all listeners when no event type specified', () => {
      // Act
      service.removeAllListeners();

      // Assert
      expect(eventEmitter.removeAllListeners).toHaveBeenCalledWith();
      expect(service['logger'].debug).toHaveBeenCalledWith(
        'Removing all event listeners',
      );
    });
  });

  describe('Advanced Event Emission Scenarios', () => {
    describe('Complex Event Patterns', () => {
      it('should emit events with complex aggregate patterns', async () => {
        const complexEvent = new TestDomainEvent(
          'user-profile-123',
          { test: 'complex-aggregate-update', profileData: { name: 'John', email: 'john@example.com' } },
          { userId: 'user-123', sessionId: 'session-456' }
        );
        
        eventEmitter.emitAsync.mockResolvedValue([] as any);

        await service.emit(complexEvent);

        expect(eventEmitter.emitAsync).toHaveBeenCalledWith('TestDomainEvent', complexEvent);
        expect(eventEmitter.emitAsync).toHaveBeenCalledWith('*', complexEvent);
        expect(eventEmitter.emitAsync).toHaveBeenCalledWith('TestAggregate.*', complexEvent);
      });

      it('should handle rapid sequential event emission', async () => {
        const events = Array.from({ length: 100 }, (_, i) => 
          new TestDomainEvent(
            `aggregate-${i}`,
            { test: `rapid-event-${i}`, sequence: i },
            { correlationId: `corr-${i}` }
          )
        );

        eventEmitter.emitAsync.mockResolvedValue([] as any);

        const startTime = Date.now();
        await Promise.all(events.map(event => service.emit(event)));
        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(1000); // Should complete within 1 second
        expect(eventEmitter.emitAsync).toHaveBeenCalledTimes(300); // 100 events * 3 calls each
      });

      it('should handle events with large payloads efficiently', async () => {
        const largePayload = {
          test: 'large-payload',
          data: Array.from({ length: 10000 }, (_, i) => ({ id: i, value: `data-${i}`.repeat(10) })),
          metadata: {
            description: 'x'.repeat(50000), // 50KB string
            tags: Array.from({ length: 1000 }, (_, i) => `tag-${i}`),
          },
        };
        
        const largeEvent = new TestDomainEvent('large-aggregate', largePayload);
        eventEmitter.emitAsync.mockResolvedValue([] as any);

        const startTime = Date.now();
        await service.emit(largeEvent);
        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(500); // Should handle large payloads efficiently
        expect(eventEmitter.emitAsync).toHaveBeenCalledTimes(3);
      });

      it('should handle concurrent event emission from multiple sources', async () => {
        const concurrentEvents = Array.from({ length: 50 }, (_, i) => {
          const aggregateType = i % 3 === 0 ? 'User' : i % 3 === 1 ? 'Order' : 'Product';
          return new TestDomainEvent(
            `${aggregateType.toLowerCase()}-${i}`,
            { test: `concurrent-${i}`, type: aggregateType },
            { 
              userId: `user-${i % 10}`,
              sessionId: `session-${Math.floor(i / 10)}`,
              correlationId: `corr-${i}`,
            }
          );
        });

        eventEmitter.emitAsync.mockResolvedValue([] as any);

        const promises = concurrentEvents.map(event => service.emit(event));
        await Promise.all(promises);

        expect(eventEmitter.emitAsync).toHaveBeenCalledTimes(150); // 50 events * 3 calls each
        
        // Verify all aggregate patterns were called
        expect(eventEmitter.emitAsync).toHaveBeenCalledWith('TestAggregate.*', expect.any(Object));
      });
    });

    describe('Error Recovery and Resilience', () => {
      it('should handle partial emission failures gracefully', async () => {
        const testEvent = new TestDomainEvent('test-aggregate', { test: 'partial-failure' });
        
        // Mock the first emission to succeed, second to fail, third to succeed
        eventEmitter.emitAsync
          .mockResolvedValueOnce([] as any) // Specific event type succeeds
          .mockRejectedValueOnce(new Error('Wildcard emission failed')) // Wildcard fails
          .mockResolvedValueOnce([] as any); // Aggregate pattern succeeds

        await expect(service.emit(testEvent)).rejects.toThrow('Wildcard emission failed');
        
        expect(service['logger'].error).toHaveBeenCalledWith(
          'Failed to emit event: TestDomainEvent',
          expect.objectContaining({
            eventId: testEvent.eventId,
            error: 'Wildcard emission failed',
          })
        );
      });

      it('should handle non-Error exceptions during emission', async () => {
        const testEvent = new TestDomainEvent('test-aggregate', { test: 'string-error' });
        const stringError = 'String-based error';
        
        eventEmitter.emitAsync.mockRejectedValue(stringError);

        await expect(service.emit(testEvent)).rejects.toBe(stringError);
        
        expect(service['logger'].error).toHaveBeenCalledWith(
          'Failed to emit event: TestDomainEvent',
          expect.objectContaining({
            eventId: testEvent.eventId,
            error: 'String-based error',
            stack: undefined,
          })
        );
      });

      it('should handle timeout scenarios during emission', async () => {
        const testEvent = new TestDomainEvent('test-aggregate', { test: 'timeout-test' });
        const timeoutError = new Error('Event emission timeout');
        timeoutError.name = 'TimeoutError';
        
        eventEmitter.emitAsync.mockRejectedValue(timeoutError);

        await expect(service.emit(testEvent)).rejects.toThrow('Event emission timeout');
        
        expect(service['logger'].error).toHaveBeenCalledWith(
          'Failed to emit event: TestDomainEvent',
          expect.objectContaining({
            eventId: testEvent.eventId,
            error: 'Event emission timeout',
          })
        );
      });
    });
  });

  describe('Advanced Subscription Management', () => {
    describe('Handler Lifecycle Management', () => {
      it('should handle subscription lifecycle with multiple handlers', async () => {
        const eventType = 'UserCreated';
        const handlers = Array.from({ length: 5 }, (_, i) => 
          jest.fn().mockImplementation(async (event) => {
            await new Promise(resolve => setTimeout(resolve, i * 10)); // Variable delay
            return `handler-${i}-processed`;
          })
        );

        // Subscribe all handlers
        handlers.forEach((handler, i) => {
          service.subscribe(eventType, handler, { async: i % 2 === 0 });
        });

        expect(eventEmitter.on).toHaveBeenCalledTimes(5);
        
        // Test that each handler receives different wrapping
        const wrappedHandlers = eventEmitter.on.mock.calls.map(call => call[1]);
        expect(wrappedHandlers).toHaveLength(5);
        
        // Simulate event handling
        const testEvent = new TestDomainEvent('user-123', { test: 'multi-handler' });
        
        await Promise.all(wrappedHandlers.map(handler => handler(testEvent)));
        
        handlers.forEach(handler => {
          expect(handler).toHaveBeenCalledWith(testEvent);
        });
      });

      it('should handle handler failures with proper error logging', async () => {
        const eventType = 'ErrorProneEvent';
        const successHandler = jest.fn().mockResolvedValue('success');
        const errorHandler = jest.fn().mockRejectedValue(new Error('Handler processing failed'));
        const timeoutHandler = jest.fn().mockImplementation(
          () => new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Handler timeout')), 100)
          )
        );

        service.subscribe(eventType, successHandler);
        service.subscribe(eventType, errorHandler);
        service.subscribe(eventType, timeoutHandler);

        const testEvent = new TestDomainEvent('test-aggregate', { test: 'error-handling' });
        const wrappedHandlers = eventEmitter.on.mock.calls.map(call => call[1]);

        // Test successful handler
        await wrappedHandlers[0](testEvent);
        expect(successHandler).toHaveBeenCalledWith(testEvent);
        
        // Test error handler
        await expect(wrappedHandlers[1](testEvent)).rejects.toThrow('Handler processing failed');
        expect(service['logger'].error).toHaveBeenCalledWith(
          'Event handler failed: TestDomainEvent',
          expect.objectContaining({
            eventId: testEvent.eventId,
            handlerName: errorHandler.name,
            error: 'Handler processing failed',
          })
        );
        
        // Test timeout handler
        await expect(wrappedHandlers[2](testEvent)).rejects.toThrow('Handler timeout');
      });

      it('should handle async vs sync handler options correctly', async () => {
        const eventType = 'AsyncSyncTest';
        const asyncHandler = jest.fn().mockResolvedValue('async-result');
        const syncHandler = jest.fn().mockResolvedValue('sync-result');
        
        service.subscribe(eventType, asyncHandler, { async: true });
        service.subscribe(eventType, syncHandler, { async: false });
        
        expect(eventEmitter.on).toHaveBeenCalledTimes(2);
        
        const testEvent = new TestDomainEvent('test-aggregate', { test: 'async-sync' });
        const [asyncWrapper, syncWrapper] = eventEmitter.on.mock.calls.map(call => call[1]);
        
        // Both should work but potentially handle errors differently
        await asyncWrapper(testEvent);
        await syncWrapper(testEvent);
        
        expect(asyncHandler).toHaveBeenCalledWith(testEvent);
        expect(syncHandler).toHaveBeenCalledWith(testEvent);
      });
    });

    describe('Wildcard and Pattern Subscriptions', () => {
      it('should handle complex wildcard subscription patterns', () => {
        const wildcardHandler = jest.fn();
        const userAggregateHandler = jest.fn();
        const orderAggregateHandler = jest.fn();
        
        service.subscribeToAll(wildcardHandler);
        service.subscribeToAggregate('User', userAggregateHandler);
        service.subscribeToAggregate('Order', orderAggregateHandler);
        
        // Verify internal subscribe calls
        expect(eventEmitter.on).toHaveBeenCalledWith('*', expect.any(Function));
        expect(eventEmitter.on).toHaveBeenCalledWith('User.*', expect.any(Function));
        expect(eventEmitter.on).toHaveBeenCalledWith('Order.*', expect.any(Function));
        
        expect(service['logger'].debug).toHaveBeenCalledWith(
          'Subscribing to event: *',
          expect.any(Object)
        );
      });

      it('should handle subscription to non-existent aggregate types', () => {
        const handler = jest.fn();
        
        service.subscribeToAggregate('NonExistentAggregate', handler);
        
        expect(eventEmitter.on).toHaveBeenCalledWith('NonExistentAggregate.*', expect.any(Function));
        expect(service['logger'].debug).toHaveBeenCalledWith(
          'Subscribing to event: NonExistentAggregate.*',
          expect.objectContaining({
            handlerName: handler.name,
          })
        );
      });

      it('should handle subscription with custom options for aggregate patterns', () => {
        const handler = jest.fn();
        const customOptions = { async: false, parallel: true, scope: 'user' as const };
        
        service.subscribeToAggregate('CustomAggregate', handler, customOptions);
        
        expect(eventEmitter.on).toHaveBeenCalledWith('CustomAggregate.*', expect.any(Function));
        expect(service['logger'].debug).toHaveBeenCalledWith(
          'Subscribing to event: CustomAggregate.*',
          expect.objectContaining({
            handlerName: handler.name,
            options: customOptions,
          })
        );
      });
    });
  });

  describe('Event Statistics and Monitoring', () => {
    describe('Advanced Statistics Calculation', () => {
      it('should handle complex event statistics scenarios', () => {
        const complexEventNames = [
          'User.Created', 'User.Updated', 'User.Deleted',
          'Order.Placed', 'Order.Cancelled', 'Order.Fulfilled',
          'Product.Added', 'Product.Updated',
          '*', 'User.*', 'Order.*',
        ];
        
        eventEmitter.eventNames.mockReturnValue(complexEventNames as any);
        
        // Mock varying listener counts
        eventEmitter.listenerCount.mockImplementation((eventName) => {
          if (eventName.includes('User')) return 3;
          if (eventName.includes('Order')) return 2;
          if (eventName.includes('Product')) return 1;
          if (eventName === '*') return 5; // Wildcard listeners
          return 0;
        });
        
        const stats = service.getEventStats();
        
        expect(stats.eventTypes).toEqual(complexEventNames);
        expect(stats.totalListeners).toBe(20); // 3+3+3+2+2+2+1+1+5+3+2 = 27, but recalculate: 3*3 + 2*3 + 1*2 + 5*1 + 3*1 + 2*1 = 9+6+2+5+3+2 = 27
        expect(eventEmitter.listenerCount).toHaveBeenCalledTimes(complexEventNames.length);
      });

      it('should handle statistics for events with zero listeners', () => {
        const eventNames = ['EmptyEvent1', 'EmptyEvent2', 'EmptyEvent3'];
        
        eventEmitter.eventNames.mockReturnValue(eventNames as any);
        eventEmitter.listenerCount.mockReturnValue(0);
        
        const stats = service.getEventStats();
        
        expect(stats).toEqual({
          totalListeners: 0,
          eventTypes: eventNames,
        });
      });

      it('should handle statistics calculation with large numbers of events', () => {
        const manyEventNames = Array.from({ length: 1000 }, (_, i) => `Event${i}`);
        
        eventEmitter.eventNames.mockReturnValue(manyEventNames as any);
        eventEmitter.listenerCount.mockImplementation((eventName) => {
          const eventNum = parseInt(eventName.replace('Event', ''));
          return eventNum % 10; // 0-9 listeners per event
        });
        
        const startTime = Date.now();
        const stats = service.getEventStats();
        const duration = Date.now() - startTime;
        
        expect(duration).toBeLessThan(100); // Should be fast even with many events
        expect(stats.eventTypes).toHaveLength(1000);
        expect(stats.totalListeners).toBeGreaterThan(0);
        expect(eventEmitter.listenerCount).toHaveBeenCalledTimes(1000);
      });
    });

    describe('Listener Detection and Management', () => {
      it('should accurately detect listeners for various event types', () => {
        const testScenarios = [
          { eventType: 'ExistingEvent', listenerCount: 5, expected: true },
          { eventType: 'EmptyEvent', listenerCount: 0, expected: false },
          { eventType: 'SingleListenerEvent', listenerCount: 1, expected: true },
          { eventType: 'ManyListenersEvent', listenerCount: 100, expected: true },
        ];
        
        testScenarios.forEach(scenario => {
          eventEmitter.listenerCount.mockReturnValue(scenario.listenerCount);
          
          const result = service.hasListeners(scenario.eventType);
          
          expect(result).toBe(scenario.expected);
          expect(eventEmitter.listenerCount).toHaveBeenCalledWith(scenario.eventType);
        });
      });

      it('should handle listener removal for specific event types', () => {
        const eventTypes = ['Event1', 'Event2', 'Event3'];
        
        eventTypes.forEach(eventType => {
          service.removeAllListeners(eventType);
          
          expect(eventEmitter.removeAllListeners).toHaveBeenCalledWith(eventType);
          expect(service['logger'].debug).toHaveBeenCalledWith(
            `Removing all listeners for event: ${eventType}`
          );
        });
        
        expect(eventEmitter.removeAllListeners).toHaveBeenCalledTimes(3);
      });

      it('should handle global listener removal correctly', () => {
        service.removeAllListeners(); // No event type specified
        
        expect(eventEmitter.removeAllListeners).toHaveBeenCalledWith();
        expect(service['logger'].debug).toHaveBeenCalledWith(
          'Removing all event listeners'
        );
      });

      it('should handle removal of listeners for non-existent events', () => {
        service.removeAllListeners('NonExistentEvent');
        
        expect(eventEmitter.removeAllListeners).toHaveBeenCalledWith('NonExistentEvent');
        expect(service['logger'].debug).toHaveBeenCalledWith(
          'Removing all listeners for event: NonExistentEvent'
        );
      });
    });
  });

  describe('Performance and Concurrency Testing', () => {
    describe('High-Frequency Event Processing', () => {
      it('should handle high-frequency event emission efficiently', async () => {
        const eventCount = 1000;
        const events = Array.from({ length: eventCount }, (_, i) => 
          new TestDomainEvent(
            `high-freq-${i}`,
            { test: `high-frequency-${i}`, batch: Math.floor(i / 100) },
            { correlationId: `batch-${Math.floor(i / 100)}` }
          )
        );
        
        eventEmitter.emitAsync.mockResolvedValue([] as any);
        
        const startTime = Date.now();
        await Promise.all(events.map(event => service.emit(event)));
        const duration = Date.now() - startTime;
        
        expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
        expect(eventEmitter.emitAsync).toHaveBeenCalledTimes(eventCount * 3); // Each event calls emitAsync 3 times
      });

      it('should handle concurrent subscription and emission', async () => {
        const concurrentHandlers = Array.from({ length: 10 }, (_, i) => 
          jest.fn().mockImplementation(async (event) => {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
            return `concurrent-handler-${i}`;
          })
        );
        
        const concurrentEvents = Array.from({ length: 20 }, (_, i) => 
          new TestDomainEvent(
            `concurrent-${i}`,
            { test: `concurrent-processing-${i}` }
          )
        );
        
        // Subscribe handlers concurrently
        await Promise.all(
          concurrentHandlers.map((handler, i) => 
            Promise.resolve(service.subscribe(`ConcurrentEvent${i % 5}`, handler))
          )
        );
        
        eventEmitter.emitAsync.mockResolvedValue([] as any);
        
        // Emit events concurrently
        const startTime = Date.now();
        await Promise.all(concurrentEvents.map(event => service.emit(event)));
        const duration = Date.now() - startTime;
        
        expect(duration).toBeLessThan(1000);
        expect(eventEmitter.on).toHaveBeenCalledTimes(10);
        expect(eventEmitter.emitAsync).toHaveBeenCalledTimes(60); // 20 events * 3 calls each
      });

      it('should handle memory-efficient event processing with large batches', async () => {
        const batchSize = 500;
        const batches = 10;
        
        eventEmitter.emitAsync.mockResolvedValue([] as any);
        
        for (let batch = 0; batch < batches; batch++) {
          const batchEvents = Array.from({ length: batchSize }, (_, i) => 
            new TestDomainEvent(
              `batch-${batch}-event-${i}`,
              { test: `batch-processing`, batchId: batch, eventIndex: i }
            )
          );
          
          const batchStartTime = Date.now();
          await Promise.all(batchEvents.map(event => service.emit(event)));
          const batchDuration = Date.now() - batchStartTime;
          
          expect(batchDuration).toBeLessThan(1000); // Each batch should complete quickly
        }
        
        expect(eventEmitter.emitAsync).toHaveBeenCalledTimes(batchSize * batches * 3);
      });
    });

    describe('Error Recovery Under Load', () => {
      it('should maintain performance during partial failures', async () => {
        const events = Array.from({ length: 100 }, (_, i) => 
          new TestDomainEvent(`load-test-${i}`, { test: `load-${i}` })
        );
        
        // Simulate intermittent failures
        eventEmitter.emitAsync.mockImplementation((eventType, event) => {
          const shouldFail = Math.random() < 0.1; // 10% failure rate
          if (shouldFail) {
            return Promise.reject(new Error(`Simulated failure for ${eventType}`));
          }
          return Promise.resolve([] as any);
        });
        
        const results = await Promise.allSettled(
          events.map(event => service.emit(event))
        );
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        expect(successful).toBeGreaterThan(80); // At least 80% should succeed
        expect(failed).toBeLessThan(20); // Less than 20% should fail
        expect(successful + failed).toBe(100);
      });

      it('should handle cascading handler failures gracefully', async () => {
        const eventType = 'CascadingFailureTest';
        const handlers = Array.from({ length: 5 }, (_, i) => 
          jest.fn().mockImplementation(async () => {
            if (i < 2) throw new Error(`Handler ${i} failed`);
            return `handler-${i}-success`;
          })
        );
        
        handlers.forEach(handler => service.subscribe(eventType, handler));
        
        const testEvent = new TestDomainEvent('test-aggregate', { test: 'cascading-failure' });
        const wrappedHandlers = eventEmitter.on.mock.calls.map(call => call[1]);
        
        const results = await Promise.allSettled(
          wrappedHandlers.map(handler => handler(testEvent))
        );
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        expect(successful).toBe(3); // Last 3 handlers should succeed
        expect(failed).toBe(2); // First 2 handlers should fail
        
        // Verify error logging for failed handlers
        expect(service['logger'].error).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Integration and Real-World Scenarios', () => {
    describe('Domain Event Workflows', () => {
      it('should handle complete user registration workflow', async () => {
        const correlationId = 'user-reg-corr-123';
        const userId = 'user-456';
        
        // Define workflow events
        class UserRegistrationStarted extends BaseDomainEvent<{ email: string; tempPassword: string }> {
          constructor(userId: string, data: { email: string; tempPassword: string }) {
            super(userId, 'User', data, { correlationId });
          }
        }
        
        class EmailVerificationSent extends BaseDomainEvent<{ email: string; verificationToken: string }> {
          constructor(userId: string, data: { email: string; verificationToken: string }) {
            super(userId, 'User', data, { correlationId });
          }
        }
        
        class UserRegistrationCompleted extends BaseDomainEvent<{ userId: string; profileData: any }> {
          constructor(userId: string, data: { userId: string; profileData: any }) {
            super(userId, 'User', data, { correlationId });
          }
        }
        
        // Set up handlers
        const emailHandler = jest.fn().mockResolvedValue(undefined);
        const profileHandler = jest.fn().mockResolvedValue(undefined);
        const auditHandler = jest.fn().mockResolvedValue(undefined);
        
        service.subscribe('UserRegistrationStarted', emailHandler);
        service.subscribe('EmailVerificationSent', profileHandler);
        service.subscribeToAll(auditHandler); // Audit all events
        
        eventEmitter.emitAsync.mockResolvedValue([] as any);
        
        // Execute workflow
        const registrationEvent = new UserRegistrationStarted(userId, {
          email: 'user@example.com',
          tempPassword: 'temp-pass-123'
        });
        
        const verificationEvent = new EmailVerificationSent(userId, {
          email: 'user@example.com',
          verificationToken: 'verify-token-123'
        });
        
        const completionEvent = new UserRegistrationCompleted(userId, {
          userId,
          profileData: { name: 'John Doe', preferences: {} }
        });
        
        await service.emit(registrationEvent);
        await service.emit(verificationEvent);
        await service.emit(completionEvent);
        
        // Verify workflow execution
        expect(eventEmitter.emitAsync).toHaveBeenCalledTimes(9); // 3 events * 3 patterns each
        expect(eventEmitter.on).toHaveBeenCalledTimes(3); // 3 subscriptions
        
        // Verify correlation IDs are maintained
        expect(registrationEvent.metadata.correlationId).toBe(correlationId);
        expect(verificationEvent.metadata.correlationId).toBe(correlationId);
        expect(completionEvent.metadata.correlationId).toBe(correlationId);
      });

      it('should handle order processing with compensation events', async () => {
        const orderId = 'order-789';
        const correlationId = 'order-proc-corr-456';
        
        class OrderPlaced extends BaseDomainEvent<{ orderId: string; items: any[]; total: number }> {
          constructor(orderId: string, data: { orderId: string; items: any[]; total: number }) {
            super(orderId, 'Order', data, { correlationId });
          }
        }
        
        class PaymentFailed extends BaseDomainEvent<{ orderId: string; reason: string; amount: number }> {
          constructor(orderId: string, data: { orderId: string; reason: string; amount: number }) {
            super(orderId, 'Payment', data, { correlationId });
          }
        }
        
        class OrderCancelled extends BaseDomainEvent<{ orderId: string; reason: string; compensation: any }> {
          constructor(orderId: string, data: { orderId: string; reason: string; compensation: any }) {
            super(orderId, 'Order', data, { correlationId });
          }
        }
        
        // Set up compensation handlers
        const inventoryHandler = jest.fn().mockResolvedValue(undefined);
        const notificationHandler = jest.fn().mockResolvedValue(undefined);
        const refundHandler = jest.fn().mockResolvedValue(undefined);
        
        service.subscribeToAggregate('Order', inventoryHandler);
        service.subscribe('PaymentFailed', refundHandler);
        service.subscribe('OrderCancelled', notificationHandler);
        
        eventEmitter.emitAsync.mockResolvedValue([] as any);
        
        // Execute order processing with compensation
        const orderEvent = new OrderPlaced(orderId, {
          orderId,
          items: [{ id: 'item-1', quantity: 2 }],
          total: 99.99
        });
        
        const paymentFailedEvent = new PaymentFailed(orderId, {
          orderId,
          reason: 'Insufficient funds',
          amount: 99.99
        });
        
        const compensationEvent = new OrderCancelled(orderId, {
          orderId,
          reason: 'Payment failed',
          compensation: { inventoryReleased: true, refundInitiated: true }
        });
        
        await service.emit(orderEvent);
        await service.emit(paymentFailedEvent);
        await service.emit(compensationEvent);
        
        expect(eventEmitter.emitAsync).toHaveBeenCalledTimes(9);
        expect(eventEmitter.on).toHaveBeenCalledTimes(3);
      });
    });

    describe('Event Correlation and Tracing', () => {
      it('should maintain event correlation across complex workflows', async () => {
        const correlationId = 'complex-workflow-corr-789';
        const sessionId = 'session-123';
        const userId = 'user-456';
        
        const events = Array.from({ length: 10 }, (_, i) => 
          new TestDomainEvent(
            `workflow-step-${i}`,
            { 
              test: `workflow-step-${i}`,
              stepNumber: i,
              previousStep: i > 0 ? `workflow-step-${i-1}` : null
            },
            {
              correlationId,
              sessionId,
              userId,
              causationId: i > 0 ? `workflow-step-${i-1}` : undefined,
            }
          )
        );
        
        eventEmitter.emitAsync.mockResolvedValue([] as any);
        
        // Process workflow sequentially to maintain causation
        for (const event of events) {
          await service.emit(event);
        }
        
        // Verify all events maintain correlation
        events.forEach((event, i) => {
          expect(event.metadata.correlationId).toBe(correlationId);
          expect(event.metadata.sessionId).toBe(sessionId);
          expect(event.metadata.userId).toBe(userId);
          
          if (i > 0) {
            expect(event.metadata.causationId).toBe(`workflow-step-${i-1}`);
          }
        });
        
        expect(eventEmitter.emitAsync).toHaveBeenCalledTimes(30); // 10 events * 3 patterns
      });

      it('should handle event tracing with distributed system scenarios', async () => {
        const traceId = 'trace-distributed-abc123';
        const serviceInstances = ['api-1', 'api-2', 'worker-1', 'worker-2'];
        
        const distributedEvents = serviceInstances.flatMap((instance, serviceIndex) => 
          Array.from({ length: 3 }, (_, eventIndex) => 
            new TestDomainEvent(
              `${instance}-event-${eventIndex}`,
              {
                test: `distributed-event`,
                serviceInstance: instance,
                eventSequence: eventIndex,
              },
              {
                correlationId: traceId,
                requestId: `req-${serviceIndex}-${eventIndex}`,
                userAgent: `Service/${instance}`,
                ipAddress: `10.0.${serviceIndex}.${eventIndex + 1}`,
              }
            )
          )
        );
        
        eventEmitter.emitAsync.mockResolvedValue([] as any);
        
        // Process distributed events concurrently
        await Promise.all(distributedEvents.map(event => service.emit(event)));
        
        // Verify distributed tracing
        expect(eventEmitter.emitAsync).toHaveBeenCalledTimes(36); // 12 events * 3 patterns
        
        distributedEvents.forEach(event => {
          expect(event.metadata.correlationId).toBe(traceId);
          expect(event.metadata.requestId).toMatch(/^req-\d+-\d+$/);
          expect(event.metadata.userAgent).toMatch(/^Service\/(api|worker)-\d+$/);
        });
      });
    });
  });

  describe('Memory Management and Cleanup', () => {
    describe('Event Handler Memory Management', () => {
      it('should handle subscription cleanup to prevent memory leaks', () => {
        const eventTypes = Array.from({ length: 100 }, (_, i) => `EventType${i}`);
        const handlers = Array.from({ length: 100 }, (_, i) => 
          jest.fn().mockImplementation(() => `handler-${i}`)
        );
        
        // Subscribe many handlers
        eventTypes.forEach((eventType, i) => {
          service.subscribe(eventType, handlers[i]);
        });
        
        expect(eventEmitter.on).toHaveBeenCalledTimes(100);
        
        // Unsubscribe half of them
        eventTypes.slice(0, 50).forEach((eventType, i) => {
          service.unsubscribe(eventType, handlers[i]);
        });
        
        expect(eventEmitter.off).toHaveBeenCalledTimes(50);
        
        // Remove all listeners for specific event types
        eventTypes.slice(50, 75).forEach(eventType => {
          service.removeAllListeners(eventType);
        });
        
        expect(eventEmitter.removeAllListeners).toHaveBeenCalledTimes(25);
        
        // Global cleanup
        service.removeAllListeners();
        
        expect(eventEmitter.removeAllListeners).toHaveBeenLastCalledWith();
      });

      it('should handle large-scale subscription and cleanup cycles', () => {
        const cycles = 10;
        const subscriptionsPerCycle = 50;
        
        for (let cycle = 0; cycle < cycles; cycle++) {
          // Subscribe handlers
          for (let i = 0; i < subscriptionsPerCycle; i++) {
            const eventType = `Cycle${cycle}Event${i}`;
            const handler = jest.fn();
            service.subscribe(eventType, handler);
          }
          
          // Simulate some processing time
          const startTime = Date.now();
          while (Date.now() - startTime < 1) {} // Brief processing
          
          // Cleanup half the subscriptions
          for (let i = 0; i < subscriptionsPerCycle / 2; i++) {
            const eventType = `Cycle${cycle}Event${i}`;
            service.removeAllListeners(eventType);
          }
        }
        
        expect(eventEmitter.on).toHaveBeenCalledTimes(cycles * subscriptionsPerCycle);
        expect(eventEmitter.removeAllListeners).toHaveBeenCalledTimes(cycles * subscriptionsPerCycle / 2);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete event flow with advanced patterns', async () => {
      // Arrange
      const handler = jest.fn().mockResolvedValue(undefined);
      const testEvent = new TestDomainEvent('aggregate-1', {
        test: 'integration-test',
        complexData: {
          nestedObject: { value: 'nested' },
          arrayData: [1, 2, 3, 4, 5],
          metadata: { version: 2, timestamp: Date.now() }
        }
      });

      eventEmitter.emitAsync.mockResolvedValue([] as any);

      // Act
      service.subscribe('TestDomainEvent', handler);
      await service.emit(testEvent);

      // Assert
      expect(eventEmitter.on).toHaveBeenCalledWith(
        'TestDomainEvent',
        expect.any(Function),
      );
      expect(eventEmitter.emitAsync).toHaveBeenCalledTimes(3);
      expect(service['logger'].debug).toHaveBeenCalledWith(
        expect.stringContaining('Emitting event'),
        expect.any(Object),
      );
    });

    it('should handle event metadata correctly with all fields', () => {
      // Arrange
      const completeMetadata = {
        userId: 'user-123',
        sessionId: 'session-456',
        correlationId: 'corr-789',
        causationId: 'cause-101',
        userRole: 'admin',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser',
        requestId: 'req-112233',
      };
      const testEvent = new TestDomainEvent(
        'aggregate-1',
        { test: 'metadata-test', includeAll: true },
        completeMetadata,
      );

      // Act
      const eventMetadata = testEvent.metadata;

      // Assert
      expect(eventMetadata.userId).toBe('user-123');
      expect(eventMetadata.sessionId).toBe('session-456');
      expect(eventMetadata.correlationId).toBeDefined();
      expect(eventMetadata.causationId).toBe('cause-101');
      expect(eventMetadata.userRole).toBe('admin');
      expect(eventMetadata.ipAddress).toBe('192.168.1.100');
      expect(eventMetadata.userAgent).toBe('Mozilla/5.0 Test Browser');
      expect(eventMetadata.requestId).toBe('req-112233');
    });

    it('should handle end-to-end event processing with multiple subscribers', async () => {
      const eventType = 'ComplexWorkflowEvent';
      const handlers = [
        jest.fn().mockResolvedValue('audit-logged'),
        jest.fn().mockResolvedValue('notification-sent'),
        jest.fn().mockResolvedValue('analytics-recorded'),
        jest.fn().mockResolvedValue('cache-updated'),
      ];
      
      // Subscribe all handlers
      handlers.forEach(handler => service.subscribe(eventType, handler));
      
      const testEvent = new TestDomainEvent(
        'workflow-aggregate',
        {
          test: 'end-to-end-test',
          workflowId: 'wf-123',
          data: { action: 'complete', result: 'success' }
        },
        {
          userId: 'user-789',
          sessionId: 'session-end-to-end',
          correlationId: 'corr-end-to-end-123',
        }
      );
      
      eventEmitter.emitAsync.mockResolvedValue([] as any);
      
      // Emit event
      await service.emit(testEvent);
      
      // Simulate handler execution
      const wrappedHandlers = eventEmitter.on.mock.calls.map(call => call[1]);
      await Promise.all(wrappedHandlers.map(handler => handler(testEvent)));
      
      // Verify complete workflow
      expect(eventEmitter.on).toHaveBeenCalledTimes(4);
      expect(eventEmitter.emitAsync).toHaveBeenCalledTimes(3); // specific, wildcard, aggregate
      handlers.forEach(handler => {
        expect(handler).toHaveBeenCalledWith(testEvent);
      });
      
      expect(service['logger'].debug).toHaveBeenCalledWith(
        'Event emitted successfully: TestDomainEvent'
      );
    });
  });
});
