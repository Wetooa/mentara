# ⚙️ BACKEND AGENT - MODULE 1 AUTHENTICATION IMPLEMENTATION

**From**: Project Manager  
**To**: Backend Agent  
**Priority**: CRITICAL  
**Module**: Module 1 - Authentication & Onboarding  
**Deadline**: Complete within 8 hours

---

## 🚨 **CRITICAL ISSUE ANALYSIS**

**Root Cause of JSON Parsing Errors**: Backend DTOs expect flat structure but frontend sends nested `{user: {...}}` objects. Backend still has Clerk-specific fields causing validation failures.

**Immediate Impact**: All registration workflows broken, preventing new user onboarding.

---

## 🎯 **PHASE 1: FIX DTO STRUCTURE CONFLICTS** (Hours 1-2)

### **File: `mentara-api/src/auth/dto/register-client.dto.ts`**

**CRITICAL CHANGES REQUIRED:**

```typescript
// REMOVE: Clerk-specific field
@IsString()
userId!: string; // ❌ DELETE THIS

// ADD: JWT authentication field
@IsString()
@MinLength(8, { message: 'Password must be at least 8 characters long' })
password!: string; // ✅ ADD THIS
```

**Complete Updated DTO Structure:**
```typescript
export class RegisterClientDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  // Keep all optional fields as-is
  @IsOptional()
  @IsString()
  middleName?: string;
  
  // ... rest of optional fields
}
```

### **File: `mentara-api/src/auth/dto/register-therapist.dto.ts`**

**CRITICAL CHANGES REQUIRED:**

```typescript
// REMOVE: Clerk-specific field
@IsString()
userId!: string; // ❌ DELETE THIS

// ADD: JWT authentication field  
@IsString()
@MinLength(8, { message: 'Password must be at least 8 characters long' })
password!: string; // ✅ ADD THIS
```

**Import Update Required:**
```typescript
import {
  // ... existing imports
  MinLength, // ✅ ADD THIS IMPORT
} from 'class-validator';
```

### **Validation After Changes:**
1. **Test Registration Endpoint**: Ensure `/auth/register/client` accepts flat structure
2. **Verify Validation**: Confirm password validation works
3. **Check Response Format**: Ensure consistent JSON response structure

---

## 🔐 **PHASE 2: OAUTH IMPLEMENTATION** (Hours 3-5)

### **Dependencies Installation:**
```bash
cd mentara-api
npm install @nestjs/passport passport-google-oauth20 passport-microsoft
npm install --save-dev @types/passport-google-oauth20
```

### **Google OAuth Strategy - `src/auth/strategies/google.strategy.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
```

### **Microsoft OAuth Strategy - `src/auth/strategies/microsoft.strategy.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-microsoft';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor() {
    super({
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: process.env.MICROSOFT_CALLBACK_URL || '/auth/microsoft/callback',
      scope: ['user.read'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }
}
```

### **OAuth Controllers - Update `src/auth/auth.controller.ts`**

**ADD OAuth Endpoints:**
```typescript
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Google OAuth Routes
@Get('google')
@UseGuards(AuthGuard('google'))
async googleAuth(@Req() req) {
  // Initiates Google OAuth flow
}

@Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleAuthRedirect(@Req() req) {
  // Handle Google OAuth callback
  return this.authService.handleOAuthLogin(req.user, 'google');
}

// Microsoft OAuth Routes  
@Get('microsoft')
@UseGuards(AuthGuard('microsoft'))
async microsoftAuth(@Req() req) {
  // Initiates Microsoft OAuth flow
}

@Get('microsoft/callback')
@UseGuards(AuthGuard('microsoft'))
async microsoftAuthRedirect(@Req() req) {
  // Handle Microsoft OAuth callback
  return this.authService.handleOAuthLogin(req.user, 'microsoft');
}
```

### **OAuth Service Method - Update `src/auth/auth.service.ts`**

**ADD OAuth Handler:**
```typescript
async handleOAuthLogin(oauthUser: any, provider: string) {
  // Check if user exists
  const existingUser = await this.prisma.user.findUnique({
    where: { email: oauthUser.email }
  });

  if (existingUser) {
    // User exists, generate tokens and return
    const tokens = await this.tokenService.generateTokens({
      userId: existingUser.id,
      email: existingUser.email,
      role: existingUser.role
    });
    
    return {
      user: existingUser,
      tokens,
      message: 'Login successful'
    };
  } else {
    // Create new user from OAuth data
    const newUser = await this.prisma.user.create({
      data: {
        email: oauthUser.email,
        firstName: oauthUser.firstName,
        lastName: oauthUser.lastName,
        role: 'client', // Default role
        isEmailVerified: true, // OAuth emails are pre-verified
        avatarUrl: oauthUser.picture
      }
    });

    const tokens = await this.tokenService.generateTokens({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    return {
      user: newUser,
      tokens,
      message: 'Account created successfully'
    };
  }
}
```

### **Module Updates - `src/auth/auth.module.ts`**

**ADD Strategies:**
```typescript
import { GoogleStrategy } from './strategies/google.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';

@Module({
  providers: [
    // ... existing providers
    GoogleStrategy,
    MicrosoftStrategy,
  ],
  // ... rest of module
})
```

---

## ⚡ **PHASE 3: ENVIRONMENT CONFIGURATION** (Hour 6)

### **Environment Variables Required:**

Add to `.env` file:
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Microsoft OAuth  
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_CALLBACK_URL=http://localhost:3001/auth/microsoft/callback
```

### **Environment Validation - `src/config/env-validation.ts`**

**ADD OAuth Variables:**
```typescript
// Add to existing schema
GOOGLE_CLIENT_ID: Joi.string().required(),
GOOGLE_CLIENT_SECRET: Joi.string().required(),
GOOGLE_CALLBACK_URL: Joi.string().required(),
MICROSOFT_CLIENT_ID: Joi.string().required(),
MICROSOFT_CLIENT_SECRET: Joi.string().required(),
MICROSOFT_CALLBACK_URL: Joi.string().required(),
```

---

## 🧪 **PHASE 4: TESTING & VALIDATION** (Hours 7-8)

### **Manual Testing Checklist:**

1. **Registration Endpoint Testing:**
   ```bash
   # Test with flat structure (should work now)
   curl -X POST http://localhost:3001/auth/register/client \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "firstName": "John",
       "lastName": "Doe"
     }'
   ```

2. **OAuth Endpoint Testing:**
   ```bash
   # Test OAuth initiation
   curl http://localhost:3001/auth/google
   curl http://localhost:3001/auth/microsoft
   ```

3. **JWT Token Generation:**
   - Verify tokens are generated properly
   - Test token refresh functionality
   - Validate token expiration

### **Unit Tests to Update:**

**File: `src/auth/auth.service.spec.ts`**
- Add tests for OAuth user creation
- Update registration tests for new DTO structure
- Test password validation

**File: `src/auth/auth.controller.spec.ts`**
- Add OAuth endpoint tests
- Update registration endpoint tests

---

## 📊 **SUCCESS CRITERIA**

### **Phase 1 Complete:**
- [ ] RegisterClientDto accepts flat structure with password
- [ ] RegisterTherapistDto accepts flat structure with password
- [ ] No Clerk references in DTOs
- [ ] Registration endpoints return consistent JSON

### **Phase 2 Complete:**
- [ ] Google OAuth flow initiated via `/auth/google`
- [ ] Microsoft OAuth flow initiated via `/auth/microsoft`
- [ ] OAuth callbacks handle user creation/login
- [ ] JWT tokens generated from OAuth

### **Phase 3 Complete:**
- [ ] Environment variables configured
- [ ] OAuth credentials set up
- [ ] Validation schema updated

### **Phase 4 Complete:**
- [ ] Manual testing successful
- [ ] Unit tests updated and passing
- [ ] Integration with frontend confirmed

---

## 🚨 **CRITICAL COORDINATION POINTS**

### **With Frontend Agent:**
1. **DTO Structure**: Confirm frontend sends flat objects (not nested)
2. **OAuth Redirects**: Coordinate callback URL handling
3. **Error Handling**: Ensure error message compatibility

### **With Project Manager:**
1. **Progress Updates**: Report completion of each phase
2. **Blockers**: Escalate any OAuth setup issues immediately
3. **Testing Results**: Share testing outcomes for coordination

---

## 🎯 **IMMEDIATE NEXT STEPS**

1. **START NOW**: Phase 1 DTO fixes (highest priority)
2. **Coordinate**: Confirm Frontend Agent is updating types simultaneously
3. **Test**: Validate registration endpoint after DTO changes
4. **Proceed**: Move to OAuth implementation once registration works

---

**This is CRITICAL PATH work - the entire Module 1 depends on these authentication fixes!**