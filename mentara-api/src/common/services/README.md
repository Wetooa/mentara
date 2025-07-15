# AI Moderation Service Integration

This module provides integration with the AI content moderation service for the Mentara platform.

## Overview

The AI moderation service provides automated content classification and crisis detection for:
- Community posts and comments
- Direct messages
- Therapy session content
- User profiles and descriptions

## Configuration

Set the following environment variables:

```bash
# AI Moderation Service Configuration
MODERATION_API_URL=http://localhost:5001
MODERATION_ENABLED=true
MODERATION_TIMEOUT=5000
```

## Usage

### Basic Content Classification

```typescript
import { ModerationService } from './moderation.service';

// Inject the service
constructor(private readonly moderationService: ModerationService) {}

// Classify content
const context = this.moderationService.createPostContext(
  userId,
  userRole,
  communityId
);

const result = await this.moderationService.classifyContent(
  'User input text here',
  context
);

// Handle result
if (result.classification === 'toxic') {
  // Block or flag content
} else if (result.crisisLevel === 'critical') {
  // Trigger crisis intervention
}
```

### Crisis Detection

```typescript
const isCrisis = await this.moderationService.checkCrisisContent(
  text,
  context
);

if (isCrisis) {
  // Trigger immediate crisis response
  await this.crisisInterventionService.handleCrisis(userId, text);
}
```

### Batch Processing

```typescript
const items = [
  { text: 'Comment 1', context: commentContext1 },
  { text: 'Comment 2', context: commentContext2 },
];

const results = await this.moderationService.batchClassify(items);

// Process results
results.forEach((result, index) => {
  if (result.classification === 'toxic') {
    // Handle toxic content
  }
});
```

## Response Format

The moderation service returns results in the following format:

```typescript
interface ModerationResult {
  classification: 'safe' | 'toxic' | 'spam' | 'crisis';
  confidence: number;
  mentalHealthContext: boolean;
  crisisLevel?: 'low' | 'medium' | 'high' | 'critical';
  immediateEscalation?: boolean;
  flags: string[];
  processingTime: number;
}
```

## Context Types

Use the appropriate context creator method:

```typescript
// For posts
const postContext = this.moderationService.createPostContext(userId, userRole, communityId);

// For comments
const commentContext = this.moderationService.createCommentContext(userId, userRole, communityId);

// For messages
const messageContext = this.moderationService.createMessageContext(userId, userRole, conversationId);

// For therapy sessions
const therapyContext = this.moderationService.createTherapyContext(userId, userRole, sessionId);
```

## Admin Endpoints

The admin moderation controller provides the following endpoints:

### Health Check
```
GET /admin/moderation/service/health
```

### Service Statistics
```
GET /admin/moderation/service/stats
```

### Test Classification
```
POST /admin/moderation/service/test-classify
Content-Type: application/json

{
  "text": "Content to test",
  "context": "post"
}
```

### Test Crisis Detection
```
POST /admin/moderation/service/test-crisis
Content-Type: application/json

{
  "text": "Content to test for crisis",
  "context": "therapy"
}
```

### Batch Testing
```
POST /admin/moderation/service/test-batch
Content-Type: application/json

{
  "items": [
    { "text": "First text", "context": "post" },
    { "text": "Second text", "context": "comment" }
  ]
}
```

## Error Handling

The service includes comprehensive error handling:

- **Service Unavailable**: Returns safe classification with service_unavailable flag
- **Timeout**: Falls back to safe classification
- **Invalid Response**: Logs error and returns safe classification
- **Network Issues**: Graceful degradation to safe classification

## Performance Considerations

- Response time target: < 100ms
- Supports batch processing for efficiency
- Includes connection pooling and caching
- Implements request timeout protection

## Integration Examples

### Post Creation
```typescript
// In posts.service.ts
async createPost(userId: string, content: string, communityId: string) {
  const context = this.moderationService.createPostContext(
    userId,
    'client',
    communityId
  );
  
  const modResult = await this.moderationService.classifyContent(
    content,
    context
  );
  
  if (modResult.classification === 'toxic') {
    throw new BadRequestException('Content violates community guidelines');
  }
  
  if (modResult.crisisLevel === 'critical') {
    await this.crisisService.triggerIntervention(userId, content);
  }
  
  // Create post with moderation metadata
  return this.prisma.post.create({
    data: {
      content,
      userId,
      communityId,
      moderationResult: modResult,
      isApproved: modResult.classification === 'safe',
    },
  });
}
```

### Message Filtering
```typescript
// In messaging.service.ts
async sendMessage(userId: string, conversationId: string, content: string) {
  const context = this.moderationService.createMessageContext(
    userId,
    'client',
    conversationId
  );
  
  const modResult = await this.moderationService.classifyContent(
    content,
    context
  );
  
  if (modResult.immediateEscalation) {
    await this.crisisService.handleCrisisMessage(userId, content);
  }
  
  // Send message with moderation flags
  return this.createMessage(userId, conversationId, content, modResult);
}
```

## Development and Testing

### Running Tests
```bash
# Unit tests
npm test src/common/services/moderation.service.spec.ts

# Integration tests
npm test src/admin/controllers/admin-moderation.controller.spec.ts
```

### Local Development
1. Start the AI moderation service on port 5001
2. Set `MODERATION_ENABLED=true` in your environment
3. Use the admin endpoints to test functionality

### Monitoring
Monitor the service health and performance through:
- Health check endpoint
- Service statistics
- Application logs
- Crisis detection alerts

## Security Considerations

- All admin endpoints require admin authentication
- Content classification includes user context
- Crisis detection triggers are logged and monitored
- Mental health context is specially protected
- Service timeouts prevent blocking operations

## Support

For issues with the AI moderation service integration:
1. Check service health endpoint
2. Review application logs
3. Verify environment configuration
4. Contact the AI/DevOps team for service issues