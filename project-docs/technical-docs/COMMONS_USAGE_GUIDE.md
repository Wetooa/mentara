# Mentara Commons Usage Guide

A practical guide for developers working with the Mentara Commons package.

## 🚀 Quick Start

### 1. Import What You Need

```typescript
// Import schemas and types
import { 
  UserSchema, 
  RegisterClientDtoSchema,
  type User, 
  type RegisterClientDto,
  validateSchema 
} from 'mentara-commons';
```

### 2. Frontend Usage (Next.js)

```typescript
// Form validation with React Hook Form
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterClientDtoSchema, type RegisterClientDto } from 'mentara-commons';

const form = useForm<RegisterClientDto>({
  resolver: zodResolver(RegisterClientDtoSchema),
});

// API response validation
const response = await fetch('/api/users/me');
const userData = await response.json();

const result = validateSchema(UserSchema, userData);
if (result.success) {
  setUser(result.data); // Type-safe user data
} else {
  console.error('Invalid user data:', result.errors);
}
```

### 3. Backend Usage (NestJS)

```typescript
// Using validation decorators (recommended)
import { ValidatedBody } from 'src/common/decorators/validate-body.decorator';
import { RegisterClientDtoSchema, type RegisterClientDto } from 'mentara-commons';

@Post('register/client')
async registerClient(
  @ValidatedBody(RegisterClientDtoSchema) dto: RegisterClientDto,
) {
  // dto is automatically validated and strongly typed
  return this.authService.registerClient(dto);
}

// Using validation pipe directly
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@Post('register/therapist')
async registerTherapist(
  @Body(new ZodValidationPipe(RegisterTherapistDtoSchema)) dto: RegisterTherapistDto,
) {
  return this.authService.registerTherapist(dto);
}
```

## 🛠 Common Patterns

### Validation Result Handling

```typescript
import { validateSchema, hasValidationErrors } from 'mentara-commons';

const result = validateSchema(UserSchema, userData);

// Pattern 1: Direct success check
if (result.success) {
  // Use result.data (typed)
} else {
  // Handle result.errors
}

// Pattern 2: Using type guard
if (!hasValidationErrors(result)) {
  // Use result.data (typed)
} else {
  // Handle errors
}

// Pattern 3: Early return
if (!result.success) {
  throw new Error(formatValidationErrors(result.errors));
}
// Continue with result.data
```

### Error Message Formatting

```typescript
import { formatValidationErrors } from 'mentara-commons';

const result = validateSchema(schema, data);
if (!result.success) {
  // Get formatted error string
  const errorMessage = formatValidationErrors(result.errors);
  // "Email must be valid, First name is required"
  
  // Get individual error objects
  result.errors.forEach(error => {
    console.log(`${error.path}: ${error.message}`);
  });
}
```

### Partial Validation (Updates)

```typescript
import { UpdateUserRequestSchema } from 'mentara-commons';

// For partial updates, use .partial() on the schema
const PartialUpdateSchema = UpdateUserRequestSchema.partial();

const result = validateSchema(PartialUpdateSchema, partialData);
```

## 🔧 Advanced Usage

### Custom Validation Messages

```typescript
import { z } from 'mentara-commons';

// Override default messages
const CustomUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  age: z.number().min(18, 'You must be at least 18 years old'),
});
```

### Schema Composition

```typescript
// Extend existing schemas
const ExtendedUserSchema = UserSchema.extend({
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean(),
  }),
});

// Pick specific fields
const UserEmailSchema = UserSchema.pick({ email: true });

// Omit fields
const UserWithoutDatesSchema = UserSchema.omit({ 
  createdAt: true, 
  updatedAt: true 
});
```

### Array Validation

```typescript
import { UserSchema, validateArray } from 'mentara-commons';

// Validate array of users
const usersResult = validateArray(UserSchema, usersData);
if (usersResult.success) {
  // usersResult.data is User[]
} else {
  // usersResult.errors contains detailed array errors
}
```

## 🎯 Best Practices

### 1. Type Import Strategy

```typescript
// ✅ Good: Import types separately
import { UserSchema, type User } from 'mentara-commons';

// ❌ Avoid: Don't import schemas as types
import type { UserSchema } from 'mentara-commons';
```

### 2. Error Handling

```typescript
// ✅ Good: Structured error handling
const result = validateSchema(schema, data);
if (!result.success) {
  return {
    success: false,
    message: formatValidationErrors(result.errors),
    errors: result.errors,
  };
}

// ❌ Avoid: Throwing raw Zod errors
try {
  schema.parse(data);
} catch (error) {
  throw error; // Raw Zod error is not user-friendly
}
```

### 3. NestJS Controller Patterns

```typescript
// ✅ Good: Use validation decorators
@Post('users')
async createUser(
  @ValidatedBody(CreateUserRequestSchema) dto: CreateUserRequest,
) {
  return this.usersService.create(dto);
}

// ✅ Also good: Manual validation with proper error handling
@Post('users')
async createUser(@Body() body: unknown) {
  const result = validateSchema(CreateUserRequestSchema, body);
  if (!result.success) {
    throw new BadRequestException(formatValidationErrors(result.errors));
  }
  
  return this.usersService.create(result.data);
}

// ❌ Avoid: No validation
@Post('users')
async createUser(@Body() body: any) {
  return this.usersService.create(body); // Unsafe!
}
```

### 4. Frontend Form Integration

```typescript
// ✅ Good: React Hook Form with Zod resolver
const form = useForm<RegisterClientDto>({
  resolver: zodResolver(RegisterClientDtoSchema),
  defaultValues: {
    firstName: '',
    lastName: '',
    email: '',
  },
});

// ✅ Also good: Manual validation on submit
const handleSubmit = (formData: unknown) => {
  const result = validateSchema(RegisterClientDtoSchema, formData);
  
  if (!result.success) {
    setErrors(result.errors);
    return;
  }
  
  // Submit validated data
  onSubmit(result.data);
};
```

## 🧪 Testing with Commons

### Testing Validation Logic

```typescript
import { validateSchema, UserSchema } from 'mentara-commons';

describe('User validation', () => {
  it('should validate correct user data', () => {
    const validUser = {
      id: 'user123',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'client',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const result = validateSchema(UserSchema, validUser);
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validUser);
  });

  it('should reject invalid user data', () => {
    const invalidUser = {
      id: '',
      email: 'invalid-email',
      role: 'invalid-role',
    };

    const result = validateSchema(UserSchema, invalidUser);
    
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(3); // id, email, role errors
  });
});
```

### Mocking API Responses

```typescript
import { UserSchema, type User } from 'mentara-commons';

// Create type-safe mock data
const mockUser: User = {
  id: 'user123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'client',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

// Validate mock data in tests
beforeEach(() => {
  const result = validateSchema(UserSchema, mockUser);
  expect(result.success).toBe(true);
});
```

## 🔄 Migration Guide

### From Class-Validator to Zod

```typescript
// ❌ Old: class-validator
import { IsEmail, IsString, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsEnum(UserRole)
  role: UserRole;
}

// ✅ New: Zod with commons
import { RegisterClientDtoSchema, type RegisterClientDto } from 'mentara-commons';

// Use in controller
@ValidatedBody(RegisterClientDtoSchema) dto: RegisterClientDto
```

### Updating Existing Controllers

```typescript
// ❌ Before
@Post('register')
async register(@Body() dto: CreateUserDto) {
  // Manual validation or class-validator
}

// ✅ After
@Post('register')
async register(
  @ValidatedBody(RegisterClientDtoSchema) dto: RegisterClientDto,
) {
  // Automatic validation with Zod
}
```

## 🚨 Common Issues & Solutions

### Issue: "Cannot resolve module 'mentara-commons'"

**Solution**: Ensure the package is properly linked:

```bash
cd mentara-commons && npm run build
cd ../mentara-api && npm install
cd ../mentara-client && npm install
```

### Issue: Type errors with inferred types

**Solution**: Import types explicitly:

```typescript
// ✅ Correct
import { type User, UserSchema } from 'mentara-commons';

// ❌ Incorrect  
import { User } from 'mentara-commons'; // User is not exported as value
```

### Issue: Validation pipe not working

**Solution**: Ensure proper pipe registration:

```typescript
// Make sure ZodValidationPipe is properly implemented
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

// And validation decorators are imported correctly
import { ValidatedBody } from 'src/common/decorators/validate-body.decorator';
```

## 📚 Next Steps

1. **Read the main README**: [README.md](./README.md) for comprehensive API documentation
2. **Check examples**: Look at `test-commons-integration.js` for working examples  
3. **Review schemas**: Browse `src/schemas/` to see all available schemas
4. **Study integration**: Check `mentara-api/src/auth/auth.controller.ts` for real usage