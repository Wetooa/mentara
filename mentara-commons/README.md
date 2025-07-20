# Mentara Commons

Shared types and validation schemas for the Mentara platform using Zod.

## Overview

This package provides a single source of truth for all shared data structures, validation schemas, and type definitions used across the Mentara frontend and backend applications.

## Features

- 🔒 **Type Safety**: All schemas are built with Zod for runtime validation and automatic TypeScript type inference
- 🎯 **Single Source of Truth**: Eliminates type duplication between frontend and backend
- ✅ **Runtime Validation**: Schemas can be used for validation on both client and server
- 📚 **Comprehensive Coverage**: Covers all major entities (Users, Therapists, Bookings, Reviews, Messaging)
- 🛠 **Utility Functions**: Includes validation helpers and error formatting utilities

## Installation

```bash
npm install mentara-commons
```

## Usage

### Basic Schema Validation

```typescript
import { UserSchema, validateSchema } from 'mentara-commons';

// Validate user data
const userData = {
  id: 'user123',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'client',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

const result = validateSchema(UserSchema, userData);

if (result.success) {
  console.log('Valid user:', result.data);
} else {
  console.error('Validation errors:', result.errors);
}
```

### Type Inference

```typescript
import type { User, CreateUserRequest } from 'mentara-commons';

// Types are automatically inferred from schemas
const user: User = {
  id: 'user123',
  email: 'john@example.com',
  role: 'client',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

const createRequest: CreateUserRequest = {
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe'
};
```

### Frontend Usage (React/Next.js)

```typescript
import { CreateReviewRequestSchema, validateSchema } from 'mentara-commons';

function ReviewForm() {
  const handleSubmit = (formData: any) => {
    const result = validateSchema(CreateReviewRequestSchema, formData);
    
    if (!result.success) {
      // Show validation errors to user
      setErrors(result.errors);
      return;
    }
    
    // Submit valid data
    submitReview(result.data);
  };
}
```

### Backend Usage (NestJS)

```typescript
import { 
  RegisterClientDtoSchema, 
  RegisterTherapistDtoSchema,
  type RegisterClientDto,
  type RegisterTherapistDto 
} from 'mentara-commons';
import { ValidatedBody } from 'src/common/decorators/validate-body.decorator';

@Controller('auth')
export class AuthController {
  @Post('register/client')
  async registerClient(
    @CurrentUserId() id: string,
    @ValidatedBody(RegisterClientDtoSchema) dto: RegisterClientDto,
  ) {
    // dto is automatically validated and typed
    return await this.authService.registerClient(id, dto);
  }

  @Post('register/therapist')
  async registerTherapist(
    @CurrentUserId() id: string,
    @ValidatedBody(RegisterTherapistDtoSchema) dto: RegisterTherapistDto,
  ) {
    return await this.authService.registerTherapist(id, dto);
  }
}
```

#### Manual Validation (Alternative Approach)

```typescript
import { CreateUserRequestSchema, validateSchema, formatValidationErrors } from 'mentara-commons';
import { BadRequestException } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Post()
  async createUser(@Body() body: any) {
    const result = validateSchema(CreateUserRequestSchema, body);
    
    if (!result.success) {
      throw new BadRequestException(formatValidationErrors(result.errors));
    }
    
    return this.usersService.create(result.data);
  }
}
```

### Custom Validation Middleware

```typescript
import { createValidationMiddleware, CreateMeetingRequestSchema } from 'mentara-commons';

// Create a validation middleware
const validateCreateMeeting = createValidationMiddleware(CreateMeetingRequestSchema);

// Use in your handler
app.post('/meetings', (req, res) => {
  try {
    const validatedData = validateCreateMeeting(req.body);
    // Process validatedData...
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## Available Schemas

### User Schemas
- `UserSchema` - Core user data
- `CreateUserRequestSchema` - User creation
- `UpdateUserRequestSchema` - User updates
- `RegisterClientDtoSchema` - Client registration
- `RegisterTherapistDtoSchema` - Therapist registration
- `UserRoleSchema` - User roles enum

### Therapist Schemas
- `TherapistApplicationSchema` - Therapist applications
- `TherapistRecommendationSchema` - Therapist recommendations
- `TherapistDashboardDataSchema` - Dashboard data
- `CreateApplicationRequestSchema` - Application creation

### Booking Schemas
- `MeetingSchema` - Meeting/session data
- `CreateMeetingRequestSchema` - Meeting creation
- `AvailableSlotSchema` - Available time slots
- `BookingFormDataSchema` - Booking form validation

### Review Schemas
- `ReviewSchema` - Review data
- `CreateReviewRequestSchema` - Review creation
- `ReviewStatsSchema` - Review analytics
- `ModerateReviewRequestSchema` - Review moderation

### Messaging Schemas
- `MessageSchema` - Message data
- `ConversationSchema` - Conversation data
- `SendMessageDtoSchema` - Message sending
- `CreateConversationDtoSchema` - Conversation creation

## NestJS Integration

The commons package includes built-in NestJS integration for seamless validation in your controllers.

### Validation Pipe

```typescript
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { RegisterClientDtoSchema } from 'mentara-commons';

@Post('register')
async register(
  @Body(new ZodValidationPipe(RegisterClientDtoSchema)) dto: RegisterClientDto
) {
  // dto is automatically validated and typed
}
```

### Validation Decorators

Use the provided decorators for cleaner controller code:

```typescript
import { 
  ValidatedBody, 
  ValidatedQuery, 
  ValidatedParams 
} from 'src/common/decorators';

@Post('users/:id')
async updateUser(
  @ValidatedParams(UpdateUserParamsSchema) params: UpdateUserParams,
  @ValidatedBody(UpdateUserRequestSchema) body: UpdateUserRequest,
  @ValidatedQuery(PaginationQuerySchema) query: PaginationQuery,
) {
  // All parameters are validated and typed
}
```

### Error Handling

The validation pipe automatically formats Zod errors into NestJS `BadRequestException`:

```typescript
// Input validation failure automatically returns:
{
  "statusCode": 400,
  "message": "Validation failed: Email must be valid, First name is required",
  "error": "Bad Request"
}
```

## Validation Utilities

### `validateSchema(schema, data)`
Basic validation function that returns a result object with success status and data/errors.

### `validateWithCustomErrors(schema, data, customErrors)`
Validation with custom error message mapping.

### `validatePartial(schema, data)`
Validates only the provided fields (useful for updates).

### `validateArray(itemSchema, data)`
Validates arrays with detailed error reporting.

### `formatValidationErrors(errors)`
Formats validation errors into a readable string.

### `createValidationMiddleware(schema)`
Creates middleware functions for web frameworks.

## Environment-Specific Validation

```typescript
import { validateForEnvironment } from 'mentara-commons';

// More lenient validation in development
const result = validateForEnvironment(
  UserSchema, 
  userData, 
  process.env.NODE_ENV
);
```

## Type Guards

```typescript
import { hasValidationErrors, getFirstValidationError } from 'mentara-commons';

const result = validateSchema(UserSchema, userData);

if (hasValidationErrors(result)) {
  const firstError = getFirstValidationError(result);
  console.error('First validation error:', firstError);
}
```

## Contributing

When adding new schemas:

1. Create the schema in the appropriate file under `src/schemas/`
2. Export the schema and its inferred types
3. Add the exports to `src/schemas/index.ts`
4. Add the types to `src/types/index.ts`
5. Update this README with usage examples

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch for changes
npm run dev

# Type check
npm run typecheck
```

## Schema Design Principles

1. **Strict by Default**: Schemas should be strict and explicit
2. **Meaningful Errors**: Provide clear, actionable error messages
3. **Consistent Naming**: Use consistent naming conventions across schemas
4. **Backwards Compatibility**: Consider backwards compatibility when updating schemas
5. **Documentation**: Include descriptions and examples in schema definitions