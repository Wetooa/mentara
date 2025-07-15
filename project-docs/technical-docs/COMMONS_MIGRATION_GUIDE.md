# Migration Guide: Adopting Mentara Commons

This guide helps migrate existing Mentara codebase to use the new shared commons package with Zod validation.

## 🎯 Migration Overview

**Goal**: Replace scattered validation logic with centralized Zod schemas from `mentara-commons`.

**Benefits**:
- ✅ Single source of truth for data structures
- ✅ Runtime validation + TypeScript types from same schema
- ✅ Consistent error handling across frontend/backend
- ✅ Better developer experience with auto-completion

## 📋 Migration Checklist

### Phase 1: Setup & Dependencies
- [x] ✅ Create `mentara-commons` package
- [x] ✅ Add Zod schemas for core entities
- [x] ✅ Build NestJS validation infrastructure
- [x] ✅ Test integration across packages
- [ ] 🔄 Migrate existing controllers to use commons
- [ ] 🔄 Migrate frontend forms to use commons
- [ ] 🔄 Remove old validation code

### Phase 2: Backend Migration (NestJS)
- [ ] Replace class-validator DTOs with Zod schemas
- [ ] Update controllers to use validation decorators
- [ ] Migrate custom validation pipes
- [ ] Update error handling

### Phase 3: Frontend Migration (Next.js)
- [ ] Replace manual validation with Zod schemas
- [ ] Update React Hook Form resolvers
- [ ] Migrate API response validation
- [ ] Update type definitions

### Phase 4: Cleanup
- [ ] Remove unused validation code
- [ ] Update tests
- [ ] Update documentation

## 🔄 Backend Migration (NestJS)

### 1. Replace Class-Validator DTOs

**Before** (class-validator):
```typescript
// src/auth/dto/register-client.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterClientDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;
}
```

**After** (commons):
```typescript
// Delete the DTO file - use commons instead
import { 
  RegisterClientDtoSchema, 
  type RegisterClientDto 
} from 'mentara-commons';
```

### 2. Update Controllers

**Before**:
```typescript
import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { RegisterClientDto } from './dto/register-client.dto';

@Controller('auth')
export class AuthController {
  @Post('register/client')
  async registerClient(
    @Body(ValidationPipe) dto: RegisterClientDto
  ) {
    return this.authService.registerClient(dto);
  }
}
```

**After**:
```typescript
import { Controller, Post } from '@nestjs/common';
import { ValidatedBody } from 'src/common/decorators/validate-body.decorator';
import { 
  RegisterClientDtoSchema, 
  type RegisterClientDto 
} from 'mentara-commons';

@Controller('auth')
export class AuthController {
  @Post('register/client')
  async registerClient(
    @ValidatedBody(RegisterClientDtoSchema) dto: RegisterClientDto
  ) {
    return this.authService.registerClient(dto);
  }
}
```

### 3. Service Layer Updates

**Before**:
```typescript
import { RegisterClientDto } from './dto/register-client.dto';

@Injectable()
export class AuthService {
  async registerClient(dto: RegisterClientDto) {
    // Implementation
  }
}
```

**After**:
```typescript
import { type RegisterClientDto } from 'mentara-commons';

@Injectable()
export class AuthService {
  async registerClient(dto: RegisterClientDto) {
    // Implementation - no changes needed!
  }
}
```

### 4. Error Handling Migration

**Before** (custom validation):
```typescript
@Post('register')
async register(@Body() body: any) {
  if (!body.email || !isEmail(body.email)) {
    throw new BadRequestException('Invalid email');
  }
  if (!body.firstName) {
    throw new BadRequestException('First name required');
  }
  // ... more validation
}
```

**After** (automatic with commons):
```typescript
@Post('register')
async register(
  @ValidatedBody(RegisterClientDtoSchema) dto: RegisterClientDto
) {
  // Validation happens automatically
  // Errors are formatted consistently
  return this.authService.register(dto);
}
```

## 🖥 Frontend Migration (Next.js)

### 1. Form Validation Migration

**Before** (manual validation):
```typescript
interface FormData {
  email: string;
  firstName: string;
  lastName: string;
}

const [errors, setErrors] = useState<Record<string, string>>({});

const validate = (data: FormData) => {
  const newErrors: Record<string, string> = {};
  
  if (!data.email || !isEmail(data.email)) {
    newErrors.email = 'Invalid email';
  }
  if (!data.firstName) {
    newErrors.firstName = 'First name is required';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = (data: FormData) => {
  if (!validate(data)) return;
  // Submit data
};
```

**After** (with commons):
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  RegisterClientDtoSchema, 
  type RegisterClientDto 
} from 'mentara-commons';

const form = useForm<RegisterClientDto>({
  resolver: zodResolver(RegisterClientDtoSchema),
});

const handleSubmit = form.handleSubmit((data) => {
  // data is automatically validated and typed
  console.log(data); // TypeScript knows this is RegisterClientDto
});
```

### 2. API Response Validation

**Before** (no validation):
```typescript
const fetchUser = async () => {
  const response = await fetch('/api/users/me');
  const user = await response.json(); // any type, no validation
  setUser(user);
};
```

**After** (with commons):
```typescript
import { validateSchema, UserSchema, type User } from 'mentara-commons';

const fetchUser = async () => {
  const response = await fetch('/api/users/me');
  const userData = await response.json();
  
  const result = validateSchema(UserSchema, userData);
  
  if (result.success) {
    setUser(result.data); // Typed as User
  } else {
    console.error('Invalid user data:', result.errors);
    // Handle validation errors
  }
};
```

### 3. Type Definitions Migration

**Before** (scattered types):
```typescript
// types/user.ts
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'therapist' | 'admin';
}

// types/auth.ts  
interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
}
```

**After** (commons types):
```typescript
// Delete local type files - use commons
import { 
  type User, 
  type RegisterClientDto 
} from 'mentara-commons';
```

## 🧪 Testing Migration

### 1. Backend Tests

**Before**:
```typescript
describe('AuthController', () => {
  it('should register client', async () => {
    const dto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };

    const result = await controller.registerClient(dto);
    expect(result).toBeDefined();
  });
});
```

**After**:
```typescript
import { 
  RegisterClientDtoSchema, 
  type RegisterClientDto,
  validateSchema 
} from 'mentara-commons';

describe('AuthController', () => {
  it('should register client with valid data', async () => {
    const dto: RegisterClientDto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };

    // Ensure test data is valid
    const validation = validateSchema(RegisterClientDtoSchema, dto);
    expect(validation.success).toBe(true);

    const result = await controller.registerClient(dto);
    expect(result).toBeDefined();
  });

  it('should reject invalid data', async () => {
    const invalidDto = {
      email: 'invalid-email',
      firstName: '',
    };

    await expect(
      controller.registerClient(invalidDto as RegisterClientDto)
    ).rejects.toThrow(BadRequestException);
  });
});
```

### 2. Frontend Tests

**Before**:
```typescript
import { render, fireEvent } from '@testing-library/react';
import RegisterForm from './RegisterForm';

test('should submit form with valid data', () => {
  const onSubmit = jest.fn();
  const { getByRole } = render(<RegisterForm onSubmit={onSubmit} />);
  
  // Fill form and submit
  fireEvent.click(getByRole('button', { name: 'Submit' }));
  
  expect(onSubmit).toHaveBeenCalled();
});
```

**After**:
```typescript
import { render, fireEvent } from '@testing-library/react';
import { validateSchema, RegisterClientDtoSchema } from 'mentara-commons';
import RegisterForm from './RegisterForm';

test('should submit form with valid data', () => {
  const onSubmit = jest.fn();
  const { getByRole } = render(<RegisterForm onSubmit={onSubmit} />);
  
  // Fill form and submit
  fireEvent.click(getByRole('button', { name: 'Submit' }));
  
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({
      email: expect.any(String),
      firstName: expect.any(String),
      lastName: expect.any(String),
    })
  );

  // Verify submitted data is valid
  const validation = validateSchema(
    RegisterClientDtoSchema, 
    onSubmit.mock.calls[0][0]
  );
  expect(validation.success).toBe(true);
});
```

## 📁 File Structure Changes

### Before Migration
```
mentara-api/
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── register-client.dto.ts
│   │   │   ├── register-therapist.dto.ts
│   │   │   └── login.dto.ts
│   │   └── auth.controller.ts
│   ├── users/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   └── users.controller.ts
│   └── ...

mentara-client/
├── types/
│   ├── user.ts
│   ├── auth.ts
│   ├── therapist.ts
│   └── ...
├── utils/
│   ├── validation.ts
│   └── ...
└── ...
```

### After Migration
```
mentara-commons/
├── src/
│   ├── schemas/
│   │   ├── user.ts
│   │   ├── auth.ts
│   │   ├── therapist.ts
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── validation.ts
│   └── index.ts

mentara-api/
├── src/
│   ├── auth/
│   │   └── auth.controller.ts  # No more DTO folder
│   ├── users/
│   │   └── users.controller.ts  # No more DTO folder
│   ├── common/
│   │   ├── pipes/
│   │   │   └── zod-validation.pipe.ts
│   │   └── decorators/
│   │       ├── validate-body.decorator.ts
│   │       ├── validate-query.decorator.ts
│   │       └── validate-params.decorator.ts
│   └── ...

mentara-client/
├── # No more types/ folder for shared types
├── # No more manual validation utilities
└── ...
```

## ⚠️ Breaking Changes

### 1. Import Paths
```typescript
// ❌ Old imports (will break)
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'types/user';

// ✅ New imports
import { 
  CreateUserRequestSchema, 
  type User, 
  type CreateUserRequest 
} from 'mentara-commons';
```

### 2. Validation Error Format
```typescript
// ❌ Old format (class-validator)
{
  statusCode: 400,
  message: [
    "email must be an email",
    "firstName should not be empty"
  ],
  error: "Bad Request"
}

// ✅ New format (Zod via commons)
{
  statusCode: 400,
  message: "Validation failed: Email must be valid, First name is required",
  error: "Bad Request"
}
```

### 3. Type Changes
```typescript
// ❌ Old: Properties might be optional when they shouldn't be
interface User {
  id?: string;  // Was optional
  email?: string;  // Was optional
}

// ✅ New: Strict typing from Zod schemas
interface User {
  id: string;  // Required
  email: string;  // Required
  firstName: string;  // Required
  lastName: string;  // Required
  role: 'client' | 'therapist' | 'moderator' | 'admin';  // Strict enum
  createdAt: string;  // Required
  updatedAt: string;  // Required
}
```

## 🚀 Migration Steps

### Step 1: Install Dependencies (✅ Done)
```bash
cd mentara-commons && npm install && npm run build
cd ../mentara-api && npm install
cd ../mentara-client && npm install
```

### Step 2: Backend Migration
1. **Start with auth module** (✅ Done)
   - Replace `RegisterClientDto` with commons schema
   - Update auth controller to use `@ValidatedBody`

2. **Migrate remaining controllers**
   ```bash
   # Find all DTO files to migrate
   find mentara-api/src -name "*.dto.ts" -type f
   
   # Find all controllers using class-validator
   grep -r "ValidationPipe\|@Body()" mentara-api/src --include="*.ts"
   ```

3. **Remove old DTO files**
   ```bash
   # After migration, remove old DTOs
   find mentara-api/src -name "dto" -type d -exec rm -rf {} +
   ```

### Step 3: Frontend Migration
1. **Update form components**
   ```bash
   # Find components using manual validation
   grep -r "validation\|validate" mentara-client/components --include="*.tsx"
   ```

2. **Replace type imports**
   ```bash
   # Find local type imports
   grep -r "from.*types/" mentara-client --include="*.ts" --include="*.tsx"
   ```

3. **Update API client validation**
   ```bash
   # Find API calls that need response validation
   grep -r "fetch\|axios" mentara-client/lib --include="*.ts"
   ```

### Step 4: Testing & Cleanup
1. **Run tests** to ensure everything works
2. **Remove unused files**
3. **Update documentation**

## 🎉 Success Criteria

Migration is complete when:
- [ ] All backend endpoints use commons schemas
- [ ] All frontend forms use commons validation
- [ ] No more local DTO/type files
- [ ] All tests pass
- [ ] Consistent error formatting across the app
- [ ] Type safety maintained/improved

## 🆘 Rollback Plan

If migration causes issues:

1. **Revert package.json changes**
   ```bash
   git checkout HEAD~1 -- mentara-api/package.json mentara-client/package.json
   ```

2. **Reinstall old dependencies**
   ```bash
   cd mentara-api && npm install
   cd ../mentara-client && npm install
   ```

3. **Revert controller changes**
   ```bash
   git checkout HEAD~1 -- mentara-api/src/auth/auth.controller.ts
   ```

4. **Remove commons dependency temporarily**
   ```bash
   npm remove mentara-commons
   ```

## 📞 Support

For migration issues:
1. Check the [Usage Guide](./USAGE_GUIDE.md)
2. Review working examples in `mentara-api/src/auth/auth.controller.ts`
3. Run the integration test: `node test-commons-integration.js`
4. Check console for detailed error messages