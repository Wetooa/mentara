/**
 * Authentication Debugging Utilities
 * 
 * These utilities help debug authentication issues in the browser console.
 * Usage: Import and call these functions from the browser console or add them to window object.
 */

import { TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from '@/lib/constants/auth';

/**
 * Check authentication token status
 */
export function checkAuthToken(): {
  hasToken: boolean;
  tokenLength: number;
  tokenPreview: string;
  tokenKey: string;
  hasRefreshToken: boolean;
  refreshTokenLength: number;
  tokenFormat: 'valid' | 'invalid' | 'missing';
  issues: string[];
} {
  const issues: string[] = [];
  let tokenFormat: 'valid' | 'invalid' | 'missing' = 'missing';
  
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  
  if (!token) {
    issues.push('No access token found in localStorage');
    // Check for token under alternative keys
    const altKeys = ['token', 'accessToken', 'authToken'];
    for (const key of altKeys) {
      const altToken = localStorage.getItem(key);
      if (altToken) {
        issues.push(`Token found under alternative key: '${key}' (consider migrating)`);
      }
    }
  } else {
    // Validate token format
    const sanitized = token.trim().replace(/^["']|["']$/g, '');
    const parts = sanitized.split('.');
    
    if (parts.length === 3) {
      tokenFormat = 'valid';
    } else {
      tokenFormat = 'invalid';
      issues.push(`Invalid token format: expected JWT with 3 parts, got ${parts.length} parts`);
    }
    
    // Check token length (JWT tokens are typically 200+ characters)
    if (sanitized.length < 50) {
      issues.push(`Token seems too short (${sanitized.length} chars) - may be invalid`);
    }
  }
  
  return {
    hasToken: !!token,
    tokenLength: token?.length || 0,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'N/A',
    tokenKey: TOKEN_STORAGE_KEY,
    hasRefreshToken: !!refreshToken,
    refreshTokenLength: refreshToken?.length || 0,
    tokenFormat,
    issues,
  };
}

/**
 * Migrate token from old key to new key
 */
export function migrateToken(): {
  success: boolean;
  message: string;
  migrated: boolean;
} {
  const oldToken = localStorage.getItem('token');
  const newToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  
  if (newToken) {
    return {
      success: true,
      message: 'Token already exists under correct key',
      migrated: false,
    };
  }
  
  if (oldToken) {
    localStorage.setItem(TOKEN_STORAGE_KEY, oldToken);
    localStorage.removeItem('token');
    return {
      success: true,
      message: 'Token migrated successfully from old key to new key',
      migrated: true,
    };
  }
  
  return {
    success: false,
    message: 'No token found under old key to migrate',
    migrated: false,
  };
}

/**
 * Clear all authentication tokens
 */
export function clearAuthTokens(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem('token'); // Also clear old key if exists
  console.log('✅ All authentication tokens cleared');
}

/**
 * Test API request with current token
 */
export async function testApiRequest(url: string = '/api/pre-assessment/chatbot/start'): Promise<{
  success: boolean;
  status: number;
  message: string;
  hasToken: boolean;
}> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  
  if (!token) {
    return {
      success: false,
      status: 0,
      message: 'No token found',
      hasToken: false,
    };
  }
  
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const fullURL = url.startsWith('http') ? url : `${baseURL}${url}`;
    
    const response = await fetch(fullURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return {
      success: response.ok,
      status: response.status,
      message: response.ok ? 'Request successful' : `Request failed: ${response.statusText}`,
      hasToken: true,
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      message: error instanceof Error ? error.message : 'Unknown error',
      hasToken: true,
    };
  }
}

/**
 * Decode JWT token (without verification)
 * Useful for debugging token contents
 */
export function decodeToken(): {
  success: boolean;
  payload?: any;
  header?: any;
  error?: string;
} {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  
  if (!token) {
    return {
      success: false,
      error: 'No token found',
    };
  }
  
  try {
    const sanitized = token.trim().replace(/^["']|["']$/g, '');
    const parts = sanitized.split('.');
    
    if (parts.length !== 3) {
      return {
        success: false,
        error: `Invalid token format: expected 3 parts, got ${parts.length}`,
      };
    }
    
    // Decode base64 (add padding if needed)
    const decodeBase64 = (str: string) => {
      try {
        return JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/')));
      } catch {
        // Try with padding
        const padded = str + '='.repeat((4 - str.length % 4) % 4);
        return JSON.parse(atob(padded.replace(/-/g, '+').replace(/_/g, '/')));
      }
    };
    
    const header = decodeBase64(parts[0]);
    const payload = decodeBase64(parts[1]);
    
    return {
      success: true,
      header,
      payload,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to decode token',
    };
  }
}

// Make utilities available on window object in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).authDebug = {
    checkToken: checkAuthToken,
    migrateToken,
    clearTokens: clearAuthTokens,
    testRequest: testApiRequest,
    decodeToken,
  };
  
  console.log('🔧 Auth debug utilities available at window.authDebug');
  console.log('   - window.authDebug.checkToken() - Check token status');
  console.log('   - window.authDebug.migrateToken() - Migrate token from old key');
  console.log('   - window.authDebug.clearTokens() - Clear all tokens');
  console.log('   - window.authDebug.testRequest(url) - Test API request');
  console.log('   - window.authDebug.decodeToken() - Decode JWT token');
}

