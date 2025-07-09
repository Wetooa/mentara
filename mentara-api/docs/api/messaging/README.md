# Messaging API

The Messaging API provides real-time communication features including direct messaging, group conversations, message reactions, read receipts, and typing indicators.

## 🏗️ Architecture

The messaging system combines:
- **REST API**: CRUD operations for conversations and messages
- **WebSocket Gateway**: Real-time bidirectional communication
- **Event-Driven**: Publishes events for downstream processing
- **Role-Based Access**: Secure conversation participation
- **Real-time Features**: Typing indicators, read receipts, reactions

## 🔄 Real-time Communication

### WebSocket Namespace
```
/messaging
```

### Connection URL
```
ws://localhost:5000/messaging
```

### Authentication
WebSocket connections require Clerk JWT token for authentication:
```javascript
const socket = io('/messaging', {
  auth: {
    token: 'your-clerk-jwt-token'
  }
});
```

---

## 📡 REST API Endpoints

### Base URL
```
/messaging
```

All endpoints require authentication via Clerk JWT token.

---

## 💬 Conversation Management

### Create Conversation
Create a new conversation between users.

**Endpoint**: `POST /messaging/conversations`

**Headers**:
```
Authorization: Bearer <clerk_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "participantIds": ["user_456"],
  "type": "DIRECT",
  "title": "Therapy Session Discussion"
}
```

**Response**: `201 Created`
```json
{
  "id": "conv_123",
  "type": "DIRECT",
  "title": "Therapy Session Discussion",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z",
  "lastMessageAt": null,
  "isActive": true,
  "participants": [
    {
      "id": "part_123",
      "userId": "user_123",
      "role": "ADMIN",
      "joinedAt": "2024-01-01T12:00:00.000Z",
      "isActive": true,
      "user": {
        "id": "user_123",
        "firstName": "John",
        "lastName": "Doe",
        "avatarUrl": "https://example.com/avatar.jpg",
        "role": "client"
      }
    },
    {
      "id": "part_456",
      "userId": "user_456",
      "role": "MEMBER",
      "joinedAt": "2024-01-01T12:00:00.000Z",
      "isActive": true,
      "user": {
        "id": "user_456",
        "firstName": "Jane",
        "lastName": "Smith",
        "avatarUrl": "https://example.com/therapist.jpg",
        "role": "therapist"
      }
    }
  ],
  "messages": []
}
```

**Conversation Types**:
- `DIRECT`: One-on-one conversation
- `GROUP`: Multi-participant group chat
- `SUPPORT`: Support group conversation
- `THERAPY`: Therapy session conversation

### Get User Conversations
Retrieve all conversations for the current user.

**Endpoint**: `GET /messaging/conversations`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response**: `200 OK`
```json
[
  {
    "id": "conv_123",
    "type": "DIRECT",
    "title": null,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "lastMessageAt": "2024-01-01T14:30:00.000Z",
    "isActive": true,
    "participants": [...],
    "messages": [
      {
        "id": "msg_789",
        "content": "Hello, how are you today?",
        "createdAt": "2024-01-01T14:30:00.000Z",
        "sender": {
          "id": "user_456",
          "firstName": "Jane",
          "lastName": "Smith",
          "avatarUrl": "https://example.com/therapist.jpg"
        }
      }
    ],
    "_count": {
      "messages": 3
    }
  }
]
```

### Get Conversation Messages
Retrieve messages for a specific conversation.

**Endpoint**: `GET /messaging/conversations/:conversationId/messages`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response**: `200 OK`
```json
[
  {
    "id": "msg_789",
    "conversationId": "conv_123",
    "senderId": "user_456",
    "content": "Hello, how are you feeling today?",
    "messageType": "TEXT",
    "createdAt": "2024-01-01T14:30:00.000Z",
    "isEdited": false,
    "editedAt": null,
    "isDeleted": false,
    "replyToId": null,
    "attachmentUrl": null,
    "attachmentName": null,
    "attachmentSize": null,
    "sender": {
      "id": "user_456",
      "firstName": "Jane",
      "lastName": "Smith",
      "avatarUrl": "https://example.com/therapist.jpg"
    },
    "replyTo": null,
    "reactions": [],
    "readReceipts": [
      {
        "id": "receipt_123",
        "userId": "user_123",
        "readAt": "2024-01-01T14:32:00.000Z",
        "user": {
          "id": "user_123",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ]
  }
]
```

---

## 📝 Message Management

### Send Message
Send a new message in a conversation.

**Endpoint**: `POST /messaging/conversations/:conversationId/messages`

**Request Body**:
```json
{
  "content": "Thank you for your support. I'm feeling much better.",
  "messageType": "TEXT",
  "replyToId": "msg_789",
  "attachmentUrl": "https://storage.example.com/file.pdf",
  "attachmentName": "therapy_worksheet.pdf",
  "attachmentSize": 524288
}
```

**Message Types**:
- `TEXT`: Plain text message
- `IMAGE`: Image attachment
- `FILE`: File attachment
- `AUDIO`: Audio message
- `VIDEO`: Video message
- `SYSTEM`: System-generated message

**Response**: `201 Created`
```json
{
  "id": "msg_790",
  "conversationId": "conv_123",
  "senderId": "user_123",
  "content": "Thank you for your support. I'm feeling much better.",
  "messageType": "TEXT",
  "createdAt": "2024-01-01T14:35:00.000Z",
  "isEdited": false,
  "editedAt": null,
  "isDeleted": false,
  "replyToId": "msg_789",
  "attachmentUrl": "https://storage.example.com/file.pdf",
  "attachmentName": "therapy_worksheet.pdf",
  "attachmentSize": 524288,
  "sender": {
    "id": "user_123",
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": "https://example.com/avatar.jpg"
  },
  "replyTo": {
    "id": "msg_789",
    "content": "Hello, how are you feeling today?",
    "sender": {
      "id": "user_456",
      "firstName": "Jane",
      "lastName": "Smith"
    }
  },
  "reactions": []
}
```

### Update Message
Edit an existing message (only message sender can edit).

**Endpoint**: `PUT /messaging/messages/:messageId`

**Request Body**:
```json
{
  "content": "Thank you for your support. I'm feeling much better now."
}
```

**Response**: `200 OK`
```json
{
  "id": "msg_790",
  "content": "Thank you for your support. I'm feeling much better now.",
  "isEdited": true,
  "editedAt": "2024-01-01T14:40:00.000Z",
  "sender": {...},
  "reactions": [...]
}
```

### Delete Message
Delete a message (only message sender can delete).

**Endpoint**: `DELETE /messaging/messages/:messageId`

**Response**: `204 No Content`
```json
{
  "success": true
}
```

---

## ✅ Read Receipts

### Mark Message as Read
Mark a specific message as read.

**Endpoint**: `POST /messaging/messages/:messageId/read`

**Response**: `200 OK`
```json
{
  "success": true
}
```

---

## 😊 Message Reactions

### Add Reaction
Add an emoji reaction to a message.

**Endpoint**: `POST /messaging/messages/:messageId/reactions`

**Request Body**:
```json
{
  "emoji": "👍"
}
```

**Response**: `201 Created`
```json
{
  "id": "reaction_123",
  "messageId": "msg_790",
  "userId": "user_456",
  "emoji": "👍",
  "createdAt": "2024-01-01T14:45:00.000Z",
  "user": {
    "id": "user_456",
    "firstName": "Jane",
    "lastName": "Smith"
  }
}
```

### Remove Reaction
Remove an emoji reaction from a message.

**Endpoint**: `DELETE /messaging/messages/:messageId/reactions/:emoji`

**Response**: `204 No Content`
```json
{
  "success": true
}
```

---

## 🚫 User Blocking

### Block User
Block a user from sending messages.

**Endpoint**: `POST /messaging/block`

**Request Body**:
```json
{
  "userId": "user_789",
  "reason": "Inappropriate behavior"
}
```

**Response**: `201 Created`
```json
{
  "success": true
}
```

### Unblock User
Unblock a previously blocked user.

**Endpoint**: `DELETE /messaging/block/:blockedUserId`

**Response**: `204 No Content`
```json
{
  "success": true
}
```

---

## 🔍 Message Search

### Search Messages
Search messages across conversations.

**Endpoint**: `GET /messaging/search`

**Query Parameters**:
- `query`: Search term (required)
- `conversationId` (optional): Limit search to specific conversation
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response**: `200 OK`
```json
[
  {
    "id": "msg_790",
    "content": "Thank you for your support. I'm feeling much better.",
    "createdAt": "2024-01-01T14:35:00.000Z",
    "sender": {
      "id": "user_123",
      "firstName": "John",
      "lastName": "Doe",
      "avatarUrl": "https://example.com/avatar.jpg"
    },
    "conversation": {
      "id": "conv_123",
      "type": "DIRECT",
      "title": null
    }
  }
]
```

---

## 🔌 WebSocket Events

### Client Events (Send to Server)

#### Authentication
Authenticate WebSocket connection:
```javascript
// Authentication happens automatically on connection
// using the token provided in the auth configuration
```

#### Join Conversation
Join a conversation room for real-time updates:
```javascript
socket.emit('join_conversation', {
  conversationId: 'conv_123'
});
```

#### Leave Conversation
Leave a conversation room:
```javascript
socket.emit('leave_conversation', {
  conversationId: 'conv_123'
});
```

#### Typing Indicator
Send typing indicator:
```javascript
// Start typing
socket.emit('typing_indicator', {
  conversationId: 'conv_123',
  isTyping: true
});

// Stop typing
socket.emit('typing_indicator', {
  conversationId: 'conv_123',
  isTyping: false
});
```

#### Join Community
Join a community room for real-time updates:
```javascript
socket.emit('join_community', {
  communityId: 'community_123'
});
```

#### Join Post
Join a post room for real-time comment updates:
```javascript
socket.emit('join_post', {
  postId: 'post_123'
});
```

### Server Events (Receive from Server)

#### Authentication Events
```javascript
// Successful authentication
socket.on('authenticated', (data) => {
  console.log('Authenticated:', data);
  // { userId: 'user_123', role: 'client', message: '...', timestamp: '...' }
});

// Authentication error
socket.on('auth_error', (error) => {
  console.error('Auth error:', error);
  // { message: 'Authentication failed', code: 'AUTH_FAILED' }
});
```

#### Conversation Events
```javascript
// New message received
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Message updated (edited)
socket.on('message_updated', (update) => {
  console.log('Message updated:', update);
  // { messageId: 'msg_123', content: 'Updated content', isEdited: true }
});

// Message read by someone
socket.on('message_read', (receipt) => {
  console.log('Message read:', receipt);
  // { messageId: 'msg_123', userId: 'user_456', readAt: '...' }
});

// Message reaction added/updated
socket.on('message_reaction', (reaction) => {
  console.log('Message reaction:', reaction);
  // { messageId: 'msg_123', reaction: { emoji: '👍', user: {...} } }
});

// User joined conversation
socket.on('user_joined_conversation', (data) => {
  console.log('User joined:', data);
  // { conversationId: 'conv_123', userId: 'user_456' }
});

// User left conversation
socket.on('user_left_conversation', (data) => {
  console.log('User left:', data);
  // { conversationId: 'conv_123', userId: 'user_456' }
});

// Typing indicator
socket.on('typing_indicator', (data) => {
  console.log('Typing indicator:', data);
  // { conversationId: 'conv_123', userId: 'user_456', isTyping: true }
});

// User status changed
socket.on('user_status_changed', (data) => {
  console.log('User status:', data);
  // { userId: 'user_456', status: 'online', timestamp: '...' }
});
```

#### Connection Events
```javascript
// Successfully joined conversation
socket.on('conversation_joined', (data) => {
  console.log('Joined conversation:', data);
  // { conversationId: 'conv_123' }
});

// Successfully left conversation
socket.on('conversation_left', (data) => {
  console.log('Left conversation:', data);
  // { conversationId: 'conv_123' }
});

// Successfully joined community
socket.on('community_joined', (data) => {
  console.log('Joined community:', data);
  // { communityId: 'community_123' }
});

// Error occurred
socket.on('error', (error) => {
  console.error('Socket error:', error);
  // { message: 'Error description' }
});
```

---

## 📊 Data Models

### CreateConversationDto
```typescript
{
  participantIds: string[];       // Array of user IDs to include
  type?: 'DIRECT' | 'GROUP' | 'SUPPORT' | 'THERAPY';
  title?: string;                 // Optional conversation title
}
```

### SendMessageDto
```typescript
{
  content: string;                // Message content
  messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'SYSTEM';
  replyToId?: string;            // ID of message being replied to
  attachmentUrl?: string;        // URL of attached file
  attachmentName?: string;       // Name of attached file
  attachmentSize?: number;       // Size of attached file in bytes
}
```

### UpdateMessageDto
```typescript
{
  content: string;               // Updated message content
}
```

### AddReactionDto
```typescript
{
  emoji: string;                 // Emoji reaction (e.g., "👍", "❤️")
}
```

### BlockUserDto
```typescript
{
  userId: string;                // ID of user to block
  reason?: string;               // Optional reason for blocking
}
```

### SearchMessagesDto
```typescript
{
  query: string;                 // Search term
  conversationId?: string;       // Optional conversation to search in
  page?: string;                 // Page number
  limit?: string;                // Items per page
}
```

---

## 🔄 Events Published

The messaging service publishes events for downstream processing:

### ConversationCreatedEvent
```typescript
{
  conversationId: string;
  createdBy: string;
  participantIds: string[];
  conversationType: 'direct' | 'group' | 'support' | 'therapy';
  title?: string;
  isPrivate: boolean;
}
```

### MessageSentEvent
```typescript
{
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'audio' | 'video' | 'system';
  sentAt: Date;
  recipientIds: string[];
  replyToMessageId?: string;
  fileAttachments?: string[];
}
```

### MessageReadEvent
```typescript
{
  messageId: string;
  readBy: string;
  readAt: Date;
  conversationId: string;
  messagesSinceLastRead: number;
}
```

---

## 🛡️ Security Features

### Authentication
- JWT token validation for all WebSocket connections
- Automatic user verification in database
- Session management with user socket tracking

### Authorization
- Conversation participation verification
- Message ownership validation for edit/delete
- Community membership verification
- Role-based access control

### Data Protection
- Message content validation
- File attachment security
- User blocking functionality
- Privacy controls

---

## 🧪 Testing

### Unit Tests
```bash
npm run test messaging.service.spec.ts
npm run test messaging.controller.spec.ts
npm run test messaging.gateway.spec.ts
```

### WebSocket Testing
```javascript
// Test WebSocket connection
const io = require('socket.io-client');
const socket = io('http://localhost:5000/messaging', {
  auth: { token: 'your-test-token' }
});

socket.on('authenticated', (data) => {
  console.log('Connected and authenticated');
  
  // Test joining conversation
  socket.emit('join_conversation', { conversationId: 'test-conv' });
});
```

---

## 🚀 Frontend Integration

### React Hooks Example
```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@clerk/nextjs';

export function useMessaging() {
  const { getToken } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const initSocket = async () => {
      const token = await getToken();
      
      const newSocket = io('/messaging', {
        auth: { token }
      });
      
      newSocket.on('authenticated', (data) => {
        setIsConnected(true);
        console.log('Connected to messaging:', data);
      });
      
      newSocket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
      });
      
      setSocket(newSocket);
    };
    
    initSocket();
    
    return () => {
      socket?.disconnect();
    };
  }, []);
  
  const sendMessage = async (conversationId: string, content: string) => {
    const response = await fetch(`/api/messaging/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    return response.json();
  };
  
  const joinConversation = (conversationId: string) => {
    socket?.emit('join_conversation', { conversationId });
  };
  
  return {
    socket,
    isConnected,
    messages,
    sendMessage,
    joinConversation,
  };
}
```

### React Component Example
```typescript
import React, { useState, useEffect } from 'react';
import { useMessaging } from './useMessaging';

export function ChatInterface({ conversationId }: { conversationId: string }) {
  const { socket, sendMessage, joinConversation, messages } = useMessaging();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    if (socket && conversationId) {
      joinConversation(conversationId);
    }
  }, [socket, conversationId]);
  
  const handleSendMessage = async () => {
    if (messageText.trim()) {
      await sendMessage(conversationId, messageText);
      setMessageText('');
    }
  };
  
  const handleTyping = (typing: boolean) => {
    setIsTyping(typing);
    socket?.emit('typing_indicator', {
      conversationId,
      isTyping: typing
    });
  };
  
  return (
    <div className=\"chat-interface\">
      <div className=\"messages\">
        {messages.map(message => (
          <div key={message.id} className=\"message\">
            <span className=\"sender\">{message.sender.firstName}:</span>
            <span className=\"content\">{message.content}</span>
          </div>
        ))}
      </div>
      
      <div className=\"input-area\">
        <input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onFocus={() => handleTyping(true)}
          onBlur={() => handleTyping(false)}
          placeholder=\"Type a message...\"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}
```

---

## 📈 Performance Considerations

### WebSocket Management
- Automatic cleanup of disconnected sockets
- User socket tracking for efficient broadcasts
- Conversation room management
- Typing indicator cleanup (5-minute timeout)

### Database Optimization
- Indexed queries for conversation participants
- Efficient message pagination
- Read receipt optimization
- Message search with case-insensitive matching

### Real-time Features
- Selective event broadcasting to participants
- Efficient typing indicator management
- User status tracking and cleanup
- Push notification integration ready

---

## 🆘 Troubleshooting

### Common Issues

#### WebSocket Connection Fails
**Cause**: Invalid or expired JWT token
**Solution**: Refresh token from Clerk and reconnect

#### Messages Not Received in Real-time
**Cause**: Not joined to conversation room
**Solution**: Ensure `join_conversation` event is emitted

#### Typing Indicators Not Working
**Cause**: Old typing indicators not cleaned up
**Solution**: Typing indicators auto-expire after 5 minutes

#### File Attachments Not Working
**Cause**: File upload service not configured
**Solution**: Configure file upload endpoints and storage

### Debug Commands
```bash
# Check active WebSocket connections
curl http://localhost:5000/admin/websocket/stats

# Test message sending
curl -X POST http://localhost:5000/api/messaging/conversations/conv_123/messages \
  -H \"Authorization: Bearer <token>\" \
  -H \"Content-Type: application/json\" \
  -d '{\"content\": \"Test message\"}'

# Check conversation participants
npx prisma studio
```

---

## 📚 Related Documentation

- [Authentication API](../auth/README.md)
- [User Management API](../users/README.md)
- [Communities API](../communities/README.md)
- [Files API](../files/README.md)
- [WebSocket Integration Guide](../../guides/websocket-integration.md)