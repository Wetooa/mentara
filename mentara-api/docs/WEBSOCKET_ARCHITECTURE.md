# WebSocket Architecture Documentation

## Overview

The WebSocket implementation in Mentara provides real-time communication for messaging, notifications, and video calls. The architecture is designed to be scalable, maintainable, and ready for production deployment.

## Architecture

### Module Structure

```
src/websocket/
├── gateways/
│   ├── messaging.gateway.ts      # Messaging WebSocket gateway (in messaging module)
│   ├── notification.gateway.ts   # Notification WebSocket gateway
│   └── video-call.gateway.ts      # Video call WebSocket gateway (P2P preparation)
├── services/
│   ├── connection-manager.service.ts  # Centralized connection management
│   └── websocket-auth.service.ts      # WebSocket authentication
└── websocket.module.ts            # Main WebSocket module
```

### Key Components

#### 1. Connection Manager Service

The `ConnectionManagerService` provides centralized connection tracking and management:

- **User-to-Socket Mapping**: Tracks which sockets belong to which users
- **Room Management**: Standardized room naming (`user_${userId}`)
- **Connection State**: Maintains active connection state across all gateways

**Key Methods:**
- `registerConnection(socket, userId, userInfo)`: Register a new connection
- `unregisterConnection(socketId)`: Remove a connection
- `getUserId(socketId)`: Get user ID for a socket
- `getSocketId(userId)`: Get socket ID for a user
- `getUserRoom(userId)`: Get standardized room name for a user

#### 2. WebSocket Authentication Service

The `WebSocketAuthService` handles authentication for WebSocket connections:

- Validates JWT tokens from connection handshake
- Extracts user information from tokens
- Provides consistent authentication across all gateways

#### 3. Gateways

##### Messaging Gateway (`/messaging` namespace)
- Real-time message delivery
- Typing indicators
- Read receipts
- Conversation updates

##### Notification Gateway (`/notifications` namespace)
- Real-time notification delivery
- Unread count updates
- Notification status changes

##### Video Call Gateway (`/video-calls` namespace)
- WebRTC signaling (offer/answer/ICE candidates)
- Call state management
- Call session tracking
- Preparation for P2P video conferencing

### Event System

The WebSocket event system uses an event bus pattern to avoid thread blocking:

1. **Domain Events**: Business logic emits domain events
2. **Event Bus**: Centralized event distribution
3. **WebSocket Event Service**: Subscribes to events and broadcasts via WebSocket
4. **Non-Blocking**: Uses `setImmediate` and `Promise.allSettled` to avoid blocking

**Example Flow:**
```
Message Created → MessageSentEvent → EventBus → WebSocketEventService → MessagingGateway → Clients
```

### Room Naming Convention

All user-specific rooms follow the standardized format:
```
user_${userId}
```

This ensures consistency across all gateways and services.

## Usage

### Connecting to a Gateway

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/messaging', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Sending Messages

```typescript
// Client side
socket.emit('message:send', {
  conversationId: 'conv-123',
  content: 'Hello!',
  messageType: 'TEXT'
});
```

### Receiving Messages

```typescript
socket.on('message', (data) => {
  console.log('New message:', data);
});
```

### Video Calls

```typescript
// Start a call
socket.emit('video:offer', {
  callId: 'call-123',
  fromUserId: 'user-1',
  toUserId: 'user-2',
  offer: rtcOffer
});

// Handle incoming call
socket.on('video:incoming-call', (data) => {
  // Handle call offer
});

// Answer call
socket.emit('video:answer', {
  callId: 'call-123',
  fromUserId: 'user-2',
  toUserId: 'user-1',
  answer: rtcAnswer
});
```

## Security

1. **Authentication**: All connections require valid JWT tokens
2. **Authorization**: User can only access their own rooms
3. **Input Validation**: All incoming messages are validated
4. **Rate Limiting**: Implemented at the gateway level

## Performance Considerations

1. **Connection Pooling**: Connection manager maintains efficient connection maps
2. **Non-Blocking Events**: Event handlers use async patterns to avoid blocking
3. **Room-Based Broadcasting**: Efficient room-based message delivery
4. **Connection Cleanup**: Automatic cleanup of expired/disconnected sessions

## Future Enhancements

1. **P2P Video Conferencing**: Video call gateway is prepared for WebRTC P2P implementation
2. **Presence System**: Track user online/offline status
3. **Message Queuing**: Queue messages for offline users
4. **Horizontal Scaling**: Redis adapter for multi-server deployments

## Testing

WebSocket tests should cover:
- Connection/disconnection
- Authentication
- Message delivery
- Room management
- Error handling

## Troubleshooting

### Connection Issues
- Check JWT token validity
- Verify CORS configuration
- Check server logs for authentication errors

### Message Delivery Issues
- Verify room naming matches `user_${userId}` format
- Check connection manager state
- Verify event bus subscriptions

### Performance Issues
- Monitor connection count
- Check for memory leaks in connection manager
- Review event handler performance

