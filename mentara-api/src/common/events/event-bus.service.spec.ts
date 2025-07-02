/* eslint-disable @typescript-eslint/unbound-method */
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
      // eslint-disable-next-line @typescript-eslint/await-thenable
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

  describe('Integration Tests', () => {
    it('should handle complete event flow', async () => {
      // Arrange
      const handler = jest.fn().mockResolvedValue(undefined);
      const testEvent = new TestDomainEvent('aggregate-1', {
        test: 'integration-test',
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

    it('should handle event metadata correctly', () => {
      // Arrange
      const metadata = {
        userId: 'user-123',
        sessionId: 'session-456',
        correlationId: 'corr-789',
      };
      const testEvent = new TestDomainEvent(
        'aggregate-1',
        { test: 'metadata-test' },
        metadata,
      );

      // Act
      const eventMetadata = testEvent.metadata;

      // Assert
      expect(eventMetadata.userId).toBe('user-123');
      expect(eventMetadata.sessionId).toBe('session-456');
      expect(eventMetadata.correlationId).toBeDefined(); // Should have generated or preserved correlationId
    });
  });
});
