# Standardized Real-Time Event System

This system provides a unified approach to handling real-time events across the Mentara application. It centralizes event processing, cache updates, and user notifications to ensure consistency and maintainability.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Real-Time Event System                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐ │
│  │                 │    │                                     │ │
│  │  useRealTime    │    │      RealTimeEventManager          │ │
│  │  Events         │◄──►│                                     │ │
│  │                 │    │  - Unified event processing         │ │
│  │  (Core Hook)    │    │  - Cache management                 │ │
│  └─────────────────┘    │  - Toast notifications              │ │
│           │              │  - Browser notifications           │ │
│           │              └─────────────────────────────────────┘ │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Domain-Specific Hooks                         │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │ │
│  │  │useRealTime  │  │useRealTime  │  │useRealTime  │  ...  │ │
│  │  │Messages     │  │Notifications│  │Meetings     │       │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features

- **Unified Event Processing**: All real-time events are processed through a single event manager
- **Centralized Cache Updates**: Consistent React Query cache management across all event types
- **Standardized Notifications**: Unified toast and browser notification handling
- **Type Safety**: Full TypeScript support with well-defined event types
- **Flexible Configuration**: Customizable toast filters, notification preferences, and subscriptions
- **Domain-Specific Hooks**: Specialized hooks for messages, notifications, meetings, and worksheets
- **Backward Compatibility**: Maintains existing API while providing new standardized approach

## Event Types

The system handles the following standardized event types:

### Message Events
- `message_sent` - New message in a conversation
- `message_updated` - Message edited
- `message_deleted` - Message deleted
- `message_read` - Message marked as read
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
- `user_status_changed` - User online/offline status changed

### Notification Events
- `notification_created` - New notification created
- `notification_updated` - Notification updated
- `notification_deleted` - Notification deleted
- `notification_read_all` - All notifications marked as read

### Meeting Events
- `meeting_started` - Meeting started
- `meeting_ended` - Meeting ended
- `meeting_participant_joined` - Participant joined meeting
- `meeting_participant_left` - Participant left meeting

### Worksheet Events
- `worksheet_assigned` - Worksheet assigned to user
- `worksheet_completed` - Worksheet completed
- `worksheet_updated` - Worksheet updated

## Usage

### Basic Usage

```typescript
import { useRealTimeEvents } from '@/hooks/realtime';

function MyComponent() {
  const realTimeEvents = useRealTimeEvents({
    enableToasts: true,
    enableBrowserNotifications: true,
    subscriptions: ['conversations:123', 'notifications:user1'],
  });

  return (
    <div>
      Connection: {realTimeEvents.isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

### Domain-Specific Usage

```typescript
import { 
  useRealTimeMessages, 
  useRealTimeNotifications,
  useRealTimeMeetings 
} from '@/hooks/realtime';

function MessagingComponent() {
  const messages = useRealTimeMessages({
    conversationId: '123',
    userId: 'user1',
    enableToasts: true,
  });

  const notifications = useRealTimeNotifications({
    userId: 'user1',
    toastFilter: (notif) => notif.priority === 'urgent',
  });

  const meetings = useRealTimeMeetings({
    userId: 'user1',
  });

  // Use the hooks as needed...
}
```

### Custom Event Filtering

```typescript
const realTimeEvents = useRealTimeEvents({
  enableToasts: true,
  toastFilter: (event) => {
    // Only show toasts for urgent notifications
    if (event.type === 'notification_created') {
      return event.data?.priority === 'urgent';
    }
    // Show all other event types
    return true;
  },
});
```

## Configuration Options

### RealTimeEventManager Configuration

```typescript
interface EventHandlerConfig {
  userId: string;
  queryClient: QueryClient;
  enableToasts?: boolean;
  enableBrowserNotifications?: boolean;
  toastFilter?: (event: BaseEvent) => boolean;
}
```

### Hook Configuration

```typescript
interface UseRealTimeEventsConfig {
  namespace?: string;                    // Socket.IO namespace (default: "/messaging")
  enableAutoConnect?: boolean;           // Auto-connect on mount (default: true)
  subscriptions?: string[];              // Channels to subscribe to
  enableToasts?: boolean;                // Enable toast notifications (default: true)
  enableBrowserNotifications?: boolean;  // Enable browser notifications (default: true)
  toastFilter?: (event: BaseEvent) => boolean; // Filter function for toasts
}
```

## Migration Guide

### From Legacy useRealTimeMessages

**Before:**
```typescript
const messages = useRealTimeMessages({
  conversationId: '123',
  userId: 'user1',
  enableToasts: true,
});
```

**After:**
```typescript
// Same API, but now uses standardized system internally
const messages = useRealTimeMessages({
  conversationId: '123',
  userId: 'user1',
  enableToasts: true,
});
```

### From Legacy useRealTimeNotifications

**Before:**
```typescript
const notifications = useRealTimeNotifications({
  userId: 'user1',
  enableToasts: true,
});
```

**After:**
```typescript
// Same API, but now uses standardized system internally
const notifications = useRealTimeNotifications({
  userId: 'user1',
  enableToasts: true,
});
```

### Adding New Event Types

1. Add the event type to `EventType` union in `realtime-event-manager.ts`:
```typescript
export type EventType = 
  | "message_sent"
  | "your_new_event"  // Add here
  | ...
```

2. Add handler in `setupEventHandlers()`:
```typescript
this.eventHandlers.set("your_new_event", this.handleYourNewEvent.bind(this));
```

3. Implement the handler method:
```typescript
private handleYourNewEvent(event: BaseEvent): void {
  // Handle your event
}
```

## Best Practices

1. **Use Domain-Specific Hooks**: Prefer `useRealTimeMessages`, `useRealTimeNotifications`, etc. over the generic `useRealTimeEvents`
2. **Filter Toasts Appropriately**: Use `toastFilter` to prevent notification spam
3. **Subscribe to Relevant Channels**: Only subscribe to channels you actually need
4. **Handle Connection State**: Always check `isConnected` before performing actions
5. **Cleanup Subscriptions**: The hooks handle cleanup automatically, but be mindful of component unmounting

## Error Handling

The system includes comprehensive error handling:
- Event processing errors are logged but don't crash the application
- Connection errors are handled gracefully with automatic reconnection
- Invalid events are logged and ignored

## Performance Considerations

- Events are processed asynchronously to avoid blocking the UI
- Cache updates use React Query's optimistic update patterns
- Connection state is managed efficiently with minimal re-renders
- Typing indicators and transient state are handled separately to avoid cache pollution

## Testing

The system is designed to be easily testable:
- Event manager can be instantiated independently for unit testing
- Mock socket connections can be provided for integration testing
- Event handlers can be tested in isolation