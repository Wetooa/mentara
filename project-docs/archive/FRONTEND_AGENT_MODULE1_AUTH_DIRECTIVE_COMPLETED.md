# 🎨 FRONTEND AGENT - MODULE 1 AUTHENTICATION IMPLEMENTATION

**From**: Project Manager  
**To**: Frontend Agent  
**Priority**: CRITICAL  
**Module**: Module 1 - Authentication & Onboarding  
**Deadline**: Complete within 6 hours

---

## 🚨 **CRITICAL ISSUE ANALYSIS**

**Root Cause of JSON Parsing Errors**: Frontend sends nested `{user: {...}}` structure but backend expects flat DTOs. Type mismatches causing serialization failures.

**Immediate Impact**: All registration workflows broken due to API communication failures.

---

## 🎯 **PHASE 1: FIX API TYPE CONFLICTS** (Hours 1-2)

### **File: `mentara-client/lib/api/services/auth.ts`**

**CRITICAL CHANGES REQUIRED:**

**Current Problematic Structure:**
```typescript
// ❌ REMOVE: This nested structure causes JSON parsing errors
registerClient: (userData: RegisterUserRequest): Promise<AuthUser> =>
  client.post("/auth/register/client", userData),
```

**Required Flat Structure:**
```typescript
// ✅ UPDATE: Use flat structure matching backend DTOs
registerClient: (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;
  address?: string;
  avatarUrl?: string;
}): Promise<AuthResponse> =>
  client.post("/auth/register/client", userData),
```

**Complete Updated Auth Service:**
```typescript
// JWT Authentication Types (UPDATE EXISTING)
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterClientCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;
  address?: string;
  avatarUrl?: string;
}

interface RegisterTherapistCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobile: string;
  province: string;
  // ... all other therapist fields as flat structure
}

// Updated Service Methods
export const createAuthService = (client: AxiosInstance) => ({
  /**
   * Login with email and password (JWT)
   */
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    client.post("/auth/login", credentials),

  /**
   * Register a new client user (FIXED)
   */
  registerClient: (credentials: RegisterClientCredentials): Promise<AuthResponse> =>
    client.post("/auth/register/client", credentials),

  /**
   * Register a new therapist user (FIXED)
   */
  registerTherapist: (credentials: RegisterTherapistCredentials): Promise<AuthResponse> =>
    client.post("/auth/register/therapist", credentials),

  /**
   * OAuth Google Authentication
   */
  initiateGoogleOAuth: (): string => 
    `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,

  /**
   * OAuth Microsoft Authentication
   */
  initiateMicrosoftOAuth: (): string => 
    `${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft`,

  // ... rest of existing methods
});
```

### **File: `mentara-client/types/api/auth.ts`**

**REMOVE Nested Types - Replace with Flat Types:**

```typescript
// ❌ DELETE: These nested structures cause issues
export interface RegisterClientDto {
  user: {
    email: string;
    // ... nested structure
  };
}

// ✅ ADD: Flat structures matching backend exactly
export interface RegisterClientRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;
  address?: string;
  avatarUrl?: string;
  hasSeenTherapistRecommendations?: boolean;
}

export interface RegisterTherapistRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobile: string;
  province: string;
  providerType: string;
  professionalLicenseType: string;
  isPRCLicensed: string;
  prcLicenseNumber: string;
  expirationDateOfLicense?: string;
  isLicenseActive: string;
  practiceStartDate: string;
  yearsOfExperience?: string;
  areasOfExpertise: any;
  assessmentTools: any;
  therapeuticApproachesUsedList: any;
  languagesOffered: any;
  providedOnlineTherapyBefore: string;
  comfortableUsingVideoConferencing: string;
  weeklyAvailability: string;
  preferredSessionLength: string;
  accepts: any;
  privateConfidentialSpace?: string;
  compliesWithDataPrivacyAct?: string;
  professionalLiabilityInsurance?: string;
  complaintsOrDisciplinaryActions?: string;
  willingToAbideByPlatformGuidelines?: string;
  sessionLength?: string;
  hourlyRate?: number;
  bio?: string;
  profileImageUrl?: string;
  applicationData?: any;
}

// Updated Response Types
export interface AuthResponse {
  user: AuthUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}
```

---

## 🔐 **PHASE 2: IMPLEMENT OAUTH COMPONENTS** (Hours 3-4)

### **File: `components/auth/ContinueWithGoogle.tsx`**

**REPLACE UI-only component with functional OAuth:**

```typescript
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function ContinueWithGoogle() {
  const router = useRouter();
  const { initiateOAuth } = useAuth();

  const handleGoogleOAuth = async () => {
    try {
      // Redirect to backend OAuth endpoint
      const oauthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('Google OAuth initiation failed:', error);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleGoogleOAuth}
      type="button"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        {/* Existing Google SVG */}
      </svg>
      Continue with Google
    </Button>
  );
}
```

### **File: `components/auth/ContinueWithMicrosoft.tsx`**

**REPLACE UI-only component with functional OAuth:**

```typescript
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function ContinueWithMicrosoft() {
  const router = useRouter();
  const { initiateOAuth } = useAuth();

  const handleMicrosoftOAuth = async () => {
    try {
      // Redirect to backend OAuth endpoint
      const oauthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft`;
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('Microsoft OAuth initiation failed:', error);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleMicrosoftOAuth}
      type="button"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        {/* Microsoft SVG icon */}
        <path fill="#F25022" d="M1 1h10v10H1z"/>
        <path fill="#00A4EF" d="M12 1h10v10H12z"/>
        <path fill="#7FBA00" d="M1 12h10v10H1z"/>
        <path fill="#FFB900" d="M12 12h10v10H12z"/>
      </svg>
      Continue with Microsoft
    </Button>
  );
}
```

### **OAuth Callback Handler - `app/(public)/(auth)/oauth-callback/page.tsx`**

**CREATE OAuth callback page:**

```typescript
'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`OAuth failed: ${error}`);
        }

        if (token) {
          await handleOAuthCallback(token);
          router.push('/user/dashboard');
        } else {
          throw new Error('No token received from OAuth callback');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        router.push('/auth/sign-in?error=oauth_failed');
      }
    };

    handleCallback();
  }, [searchParams, router, handleOAuthCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Completing sign-in...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}
```

---

## 🔧 **PHASE 3: FIX AUTH COMPONENTS** (Hours 5-6)

### **File: `components/auth/SignUp.tsx`**

**UPDATE registration form to use flat structure:**

```typescript
// Update form submission to use flat structure
const onSubmit = async (values: z.infer<typeof formSchema>) => {
  try {
    setIsLoading(true);
    
    // ✅ Send flat structure (not nested)
    const registrationData = {
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      // No nesting!
    };

    const result = await api.auth.registerClient(registrationData);
    
    // Handle successful registration
    toast.success('Account created successfully!');
    router.push('/user/dashboard');
  } catch (error) {
    console.error('Registration error:', error);
    toast.error('Registration failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

### **File: `hooks/useAuth.ts`**

**ADD OAuth handling methods:**

```typescript
// Add to useAuth hook
export function useAuth() {
  // ... existing code

  // OAuth Methods
  const initiateGoogleOAuth = () => {
    const oauthUrl = api.auth.initiateGoogleOAuth();
    window.location.href = oauthUrl;
  };

  const initiateMicrosoftOAuth = () => {
    const oauthUrl = api.auth.initiateMicrosoftOAuth();
    window.location.href = oauthUrl;
  };

  const handleOAuthCallback = async (token: string) => {
    try {
      // Store the token
      auth.setTokens(token, ''); // Assuming single token for simplicity
      
      // Fetch user data
      await refetchUser();
      
      return { success: true };
    } catch (error) {
      console.error('OAuth callback handling failed:', error);
      throw error;
    }
  };

  return {
    // ... existing returns
    initiateGoogleOAuth,
    initiateMicrosoftOAuth,
    handleOAuthCallback,
  };
}
```

### **File: `contexts/AuthContext.tsx`**

**REMOVE any remaining Clerk references:**

```typescript
// Ensure all methods use JWT, not Clerk
// Clean up any remaining clerk-specific code
// Ensure SecureTokenStorage methods are used properly

// Update registration method to use flat structure
const register = async (credentials: RegisterCredentials) => {
  try {
    setIsLoading(true);
    
    // Use flat structure
    const response = await axios.post(`${API_BASE}/auth/register/${credentials.role}`, {
      email: credentials.email,
      password: credentials.password,
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      // No nesting!
    });

    // Handle response and store tokens
    const { user, tokens } = response.data;
    setUser(user);
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    setIsAuthenticated(true);
    
    // Store in secure storage
    SecureTokenStorage.setUser(user);
    SecureTokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

---

## 🛡️ **PHASE 4: UPDATE ENVIRONMENT CONFIGURATION**

### **File: `.env.local`**

**ADD OAuth environment variables:**

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# OAuth Callback URLs (for frontend handling)
NEXT_PUBLIC_GOOGLE_OAUTH_CALLBACK=/oauth-callback
NEXT_PUBLIC_MICROSOFT_OAUTH_CALLBACK=/oauth-callback

# Frontend URLs (for backend redirects)
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

---

## 🧪 **TESTING & VALIDATION CHECKLIST**

### **Manual Testing Required:**

1. **Registration Flow Testing:**
   ```bash
   # Test client registration
   1. Navigate to /auth/sign-up
   2. Fill form with valid data
   3. Submit and verify NO JSON parsing errors
   4. Confirm successful registration
   ```

2. **OAuth Flow Testing:**
   ```bash
   # Test Google OAuth
   1. Click "Continue with Google" button
   2. Verify redirect to Google OAuth
   3. Complete OAuth flow
   4. Verify redirect back to app
   5. Confirm user authentication

   # Test Microsoft OAuth
   1. Click "Continue with Microsoft" button
   2. Verify redirect to Microsoft OAuth
   3. Complete OAuth flow
   4. Verify redirect back to app
   5. Confirm user authentication
   ```

3. **Error Handling Testing:**
   ```bash
   # Test various error scenarios
   1. Invalid credentials
   2. Network errors
   3. OAuth cancellation
   4. OAuth failure
   ```

### **Code Quality Checks:**

1. **Type Safety:**
   - No TypeScript errors
   - All API calls properly typed
   - No `any` types in critical paths

2. **Error Handling:**
   - Proper try-catch blocks
   - User-friendly error messages
   - Error boundaries where appropriate

3. **Security:**
   - No credentials in client-side code
   - Proper token storage
   - Secure HTTP-only cookies where possible

---

## 📊 **SUCCESS CRITERIA**

### **Phase 1 Complete:**
- [ ] Auth service uses flat DTO structures
- [ ] Registration types match backend exactly
- [ ] No nested object structures in API calls
- [ ] Type definitions aligned with commons

### **Phase 2 Complete:**
- [ ] Google OAuth button initiates real OAuth flow
- [ ] Microsoft OAuth button initiates real OAuth flow
- [ ] OAuth callback page handles responses
- [ ] Successful OAuth redirects to dashboard

### **Phase 3 Complete:**
- [ ] SignUp component uses flat registration data
- [ ] Auth hooks support OAuth flows
- [ ] No Clerk references remaining
- [ ] Error handling improved

### **Phase 4 Complete:**
- [ ] Environment variables configured
- [ ] Manual testing passes
- [ ] Type safety maintained
- [ ] Security best practices followed

---

## 🚨 **CRITICAL COORDINATION POINTS**

### **With Backend Agent:**
1. **DTO Structure**: Ensure backend accepts flat structures you're sending
2. **OAuth Endpoints**: Confirm OAuth endpoints are ready before testing
3. **Response Format**: Verify response structure matches your types

### **With Project Manager:**
1. **Progress Updates**: Report completion after each phase
2. **Testing Results**: Share any issues discovered during testing
3. **Blockers**: Escalate OAuth setup or environment issues

---

## 🎯 **IMMEDIATE NEXT STEPS**

1. **START NOW**: Phase 1 type fixes (coordinate with Backend Agent)
2. **Test Registration**: Verify flat structure resolves JSON parsing errors
3. **Implement OAuth**: Add functional OAuth flows
4. **End-to-End Test**: Complete authentication flows

---

**This is CRITICAL PATH work - Module 1 success depends on these authentication fixes!**