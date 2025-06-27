export interface EventMetadata {
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  causationId?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export interface DomainEvent<T = any> {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  eventData: T;
  metadata: EventMetadata;
  timestamp: Date;
  version: number;
}

export abstract class BaseDomainEvent<T = any> implements DomainEvent<T> {
  public readonly eventId: string;
  public readonly eventType: string;
  public readonly aggregateId: string;
  public readonly aggregateType: string;
  public readonly eventData: T;
  public readonly metadata: EventMetadata;
  public readonly timestamp: Date;
  public readonly version: number;

  constructor(
    aggregateId: string,
    aggregateType: string,
    eventData: T,
    metadata: EventMetadata = {},
    version: number = 1,
  ) {
    this.eventId = this.generateEventId();
    this.eventType = this.constructor.name;
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.eventData = eventData;
    this.metadata = {
      correlationId: this.generateCorrelationId(),
      ...metadata,
    };
    this.timestamp = new Date();
    this.version = version;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Event Handler Decorator Interface
export interface EventHandlerOptions {
  async?: boolean;
  parallel?: boolean;
  scope?: 'user' | 'global';
}

// Event Bus Interface
export interface IEventBus {
  emit<T = any>(event: DomainEvent<T>): Promise<void>;
  subscribe<T = any>(
    eventType: string,
    handler: (event: DomainEvent<T>) => Promise<void>,
    options?: EventHandlerOptions,
  ): void;
  unsubscribe(eventType: string, handler: (...args: any[]) => any): void;
}