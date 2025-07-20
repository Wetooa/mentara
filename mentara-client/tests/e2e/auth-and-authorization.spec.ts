import { test, expect } from '@playwright/test';
import { loginAs, logout, TEST_ACCOUNTS } from '../helpers/auth';
import { navigateAndVerify, verifyCurrentPage, verifyProtectedAccess } from '../helpers/navigation';
import { fillForm, submitForm, verifyFormSuccess } from '../helpers/forms';
import { waitForApiCall } from '../helpers/api';

test.describe('Authentication and Authorization', () => {
  test.describe('Login Flow', () => {
    test('should login with valid credentials', async ({ page }) => {
      await page.goto('/sign-in');
      
      // Fill login form
      await fillForm(page, {
        identifier: TEST_ACCOUNTS.basicClient.email,
        password: TEST_ACCOUNTS.basicClient.password
      });
      
      // Submit login
      await submitForm(page);
      
      // Wait for authentication
      await waitForApiCall(page, '/api/auth/session', 'GET');
      
      // Verify redirect to appropriate dashboard
      await verifyCurrentPage(page, '/user');
      
      // Verify user is logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('should handle invalid credentials', async ({ page }) => {
      await page.goto('/sign-in');
      
      // Fill login form with invalid credentials
      await fillForm(page, {
        identifier: 'invalid@email.com',
        password: 'wrongpassword'
      });
      
      // Submit login
      await submitForm(page);
      
      // Verify error message
      await expect(page.locator('text="Invalid credentials"')).toBeVisible();
      
      // Verify user stays on login page
      await verifyCurrentPage(page, '/sign-in');
    });

    test('should handle account locked scenario', async ({ page }) => {
      await page.goto('/sign-in');
      
      // Mock account locked response
      await page.route('**/api/auth/login', route => {
        route.fulfill({
          status: 423,
          body: JSON.stringify({ 
            error: 'Account locked due to too many failed attempts',
            code: 'ACCOUNT_LOCKED'
          })
        });
      });
      
      // Fill login form
      await fillForm(page, {
        identifier: TEST_ACCOUNTS.basicClient.email,
        password: 'wrongpassword'
      });
      
      // Submit login
      await submitForm(page);
      
      // Verify account locked message
      await expect(page.locator('text="Account locked"')).toBeVisible();
      
      // Verify unlock instructions
      await expect(page.locator('[data-testid="unlock-instructions"]')).toBeVisible();
    });

    test('should handle two-factor authentication', async ({ page }) => {
      await page.goto('/sign-in');
      
      // Mock 2FA required response
      await page.route('**/api/auth/login', route => {
        route.fulfill({
          status: 202,
          body: JSON.stringify({ 
            requiresTwoFactor: true,
            sessionId: 'temp-session-id'
          })
        });
      });
      
      // Fill login form
      await fillForm(page, {
        identifier: TEST_ACCOUNTS.basicClient.email,
        password: TEST_ACCOUNTS.basicClient.password
      });
      
      // Submit login
      await submitForm(page);
      
      // Verify 2FA page
      await verifyCurrentPage(page, '/verify');
      
      // Verify 2FA form
      await expect(page.locator('[data-testid="2fa-form"]')).toBeVisible();
      
      // Fill 2FA code
      await fillForm(page, {
        verificationCode: '123456'
      });
      
      // Submit 2FA
      await submitForm(page);
      
      // Verify successful authentication
      await verifyCurrentPage(page, '/user');
    });

    test('should handle SSO authentication', async ({ page }) => {
      await page.goto('/sign-in');
      
      // Click Google SSO button
      await page.locator('[data-testid="sso-google"]').click();
      
      // Mock SSO callback
      await page.route('**/api/auth/sso-callback', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ 
            success: true,
            user: TEST_ACCOUNTS.basicClient
          })
        });
      });
      
      // Navigate to SSO callback
      await page.goto('/sso-callback?code=mock-auth-code');
      
      // Verify successful SSO login
      await verifyCurrentPage(page, '/user');
      
      // Verify user is logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });
  });

  test.describe('Registration Flow', () => {
    test('should register new user account', async ({ page }) => {
      await page.goto('/sign-up');
      
      // Fill registration form
      await fillForm(page, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe.test@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        termsAccepted: 'true'
      });
      
      // Submit registration
      await submitForm(page);
      
      // Wait for registration API call
      await waitForApiCall(page, '/api/auth/register', 'POST');
      
      // Verify redirect to verification page
      await verifyCurrentPage(page, '/verify-account');
      
      // Verify verification message
      await expect(page.locator('text="Check your email for verification"')).toBeVisible();
    });

    test('should handle email already exists', async ({ page }) => {
      await page.goto('/sign-up');
      
      // Fill registration form with existing email
      await fillForm(page, {
        firstName: 'John',
        lastName: 'Doe',
        email: TEST_ACCOUNTS.basicClient.email,
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!'
      });
      
      // Submit registration
      await submitForm(page);
      
      // Verify error message
      await expect(page.locator('text="Email already exists"')).toBeVisible();
      
      // Verify user stays on registration page
      await verifyCurrentPage(page, '/sign-up');
    });

    test('should validate password strength', async ({ page }) => {
      await page.goto('/sign-up');
      
      // Test weak password
      await fillForm(page, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe.test@example.com',
        password: '123',
        confirmPassword: '123'
      });
      
      // Submit registration
      await submitForm(page);
      
      // Verify password validation errors
      await expect(page.locator('text="Password must be at least 8 characters"')).toBeVisible();
      await expect(page.locator('text="Password must contain uppercase letter"')).toBeVisible();
      await expect(page.locator('text="Password must contain special character"')).toBeVisible();
    });

    test('should validate password confirmation', async ({ page }) => {
      await page.goto('/sign-up');
      
      // Fill form with mismatched passwords
      await fillForm(page, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe.test@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'DifferentPassword123!'
      });
      
      // Submit registration
      await submitForm(page);
      
      // Verify password mismatch error
      await expect(page.locator('text="Passwords do not match"')).toBeVisible();
    });
  });

  test.describe('Role-Based Access Control', () => {
    test('should redirect client to user dashboard', async ({ page }) => {
      await loginAs(page, 'basicClient');
      
      // Verify redirect to user dashboard
      await verifyCurrentPage(page, '/user');
      
      // Verify user-specific content
      await expect(page.locator('[data-testid="user-dashboard"]')).toBeVisible();
    });

    test('should redirect therapist to therapist dashboard', async ({ page }) => {
      await loginAs(page, 'approvedTherapist');
      
      // Verify redirect to therapist dashboard
      await verifyCurrentPage(page, '/therapist');
      
      // Verify therapist-specific content
      await expect(page.locator('[data-testid="therapist-dashboard"]')).toBeVisible();
    });

    test('should redirect admin to admin dashboard', async ({ page }) => {
      await loginAs(page, 'superAdmin');
      
      // Verify redirect to admin dashboard
      await verifyCurrentPage(page, '/admin');
      
      // Verify admin-specific content
      await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
    });

    test('should block unauthorized access to admin routes', async ({ page }) => {
      await loginAs(page, 'basicClient');
      
      // Try to access admin page
      await page.goto('/admin');
      
      // Verify access denied
      await expect(page.locator('text="Access denied"')).toBeVisible();
      
      // Verify redirect to appropriate dashboard
      await verifyCurrentPage(page, '/user');
    });

    test('should block unauthorized access to therapist routes', async ({ page }) => {
      await loginAs(page, 'basicClient');
      
      // Try to access therapist page
      await page.goto('/therapist');
      
      // Verify access denied
      await expect(page.locator('text="Access denied"')).toBeVisible();
      
      // Verify redirect to appropriate dashboard
      await verifyCurrentPage(page, '/user');
    });

    test('should block unauthenticated access to protected routes', async ({ page }) => {
      // Try to access protected route without authentication
      await page.goto('/user/dashboard');
      
      // Verify redirect to login
      await verifyCurrentPage(page, '/sign-in');
      
      // Verify login prompt
      await expect(page.locator('text="Please sign in to continue"')).toBeVisible();
    });

    test('should preserve redirect URL after login', async ({ page }) => {
      // Try to access protected route
      await page.goto('/user/therapist');
      
      // Verify redirect to login with return URL
      await verifyCurrentPage(page, '/sign-in');
      
      // Login
      await fillForm(page, {
        identifier: TEST_ACCOUNTS.basicClient.email,
        password: TEST_ACCOUNTS.basicClient.password
      });
      
      await submitForm(page);
      
      // Verify redirect to original URL
      await verifyCurrentPage(page, '/user/therapist');
    });
  });

  test.describe('Session Management', () => {
    test('should handle session expiration', async ({ page }) => {
      await loginAs(page, 'basicClient');
      
      // Mock session expiration
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 401,
          body: JSON.stringify({ error: 'Session expired' })
        });
      });
      
      // Try to access API endpoint
      await page.goto('/user/dashboard');
      
      // Verify session expiration handling
      await expect(page.locator('text="Session expired"')).toBeVisible();
      
      // Verify redirect to login
      await verifyCurrentPage(page, '/sign-in');
    });

    test('should handle concurrent sessions', async ({ page, browser }) => {
      await loginAs(page, 'basicClient');
      
      // Open second browser context
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();
      
      // Login in second session
      await loginAs(page2, 'basicClient');
      
      // Verify both sessions work
      await page.goto('/user/dashboard');
      await expect(page.locator('[data-testid="user-dashboard"]')).toBeVisible();
      
      await page2.goto('/user/dashboard');
      await expect(page2.locator('[data-testid="user-dashboard"]')).toBeVisible();
      
      await context2.close();
    });

    test('should handle session refresh', async ({ page }) => {
      await loginAs(page, 'basicClient');
      
      // Mock token refresh
      await page.route('**/api/auth/refresh', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ 
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token'
          })
        });
      });
      
      // Navigate to dashboard
      await page.goto('/user/dashboard');
      
      // Verify session refresh happens automatically
      await waitForApiCall(page, '/api/auth/refresh', 'POST');
      
      // Verify user remains logged in
      await expect(page.locator('[data-testid="user-dashboard"]')).toBeVisible();
    });

    test('should handle logout', async ({ page }) => {
      await loginAs(page, 'basicClient');
      
      // Logout
      await logout(page);
      
      // Verify redirect to landing page
      await verifyCurrentPage(page, '/');
      
      // Verify user is logged out
      await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
      
      // Try to access protected route
      await page.goto('/user/dashboard');
      
      // Verify redirect to login
      await verifyCurrentPage(page, '/sign-in');
    });

    test('should handle force logout', async ({ page }) => {
      await loginAs(page, 'basicClient');
      
      // Navigate to force logout endpoint
      await page.goto('/force-logout');
      
      // Verify logout message
      await expect(page.locator('text="You have been logged out"')).toBeVisible();
      
      // Verify redirect to landing page
      await verifyCurrentPage(page, '/');
      
      // Verify user is logged out
      await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
    });
  });

  test.describe('Account Security', () => {
    test('should handle password reset', async ({ page }) => {
      await page.goto('/sign-in');
      
      // Click forgot password
      await page.locator('[data-testid="forgot-password"]').click();
      
      // Fill email
      await fillForm(page, {
        email: TEST_ACCOUNTS.basicClient.email
      });
      
      // Submit reset request
      await submitForm(page);
      
      // Wait for reset API call
      await waitForApiCall(page, '/api/auth/password-reset', 'POST');
      
      // Verify success message
      await verifyFormSuccess(page, 'Password reset email sent');
      
      // Mock password reset token
      await page.goto('/reset-password?token=mock-reset-token');
      
      // Fill new password
      await fillForm(page, {
        password: 'NewSecurePassword123!',
        confirmPassword: 'NewSecurePassword123!'
      });
      
      // Submit new password
      await submitForm(page);
      
      // Verify password reset success
      await verifyFormSuccess(page, 'Password reset successfully');
      
      // Verify redirect to login
      await verifyCurrentPage(page, '/sign-in');
    });

    test('should handle account verification', async ({ page }) => {
      // Mock verification token
      await page.goto('/verify?token=mock-verification-token');
      
      // Mock verification API call
      await page.route('**/api/auth/verify', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true })
        });
      });
      
      // Verify account verification
      await waitForApiCall(page, '/api/auth/verify', 'POST');
      
      // Verify success message
      await expect(page.locator('text="Account verified successfully"')).toBeVisible();
      
      // Verify redirect to login
      await verifyCurrentPage(page, '/sign-in');
    });

    test('should handle invalid verification token', async ({ page }) => {
      // Mock invalid verification token
      await page.goto('/verify?token=invalid-token');
      
      // Mock verification API call
      await page.route('**/api/auth/verify', route => {
        route.fulfill({
          status: 400,
          body: JSON.stringify({ error: 'Invalid verification token' })
        });
      });
      
      // Verify error message
      await expect(page.locator('text="Invalid verification token"')).toBeVisible();
      
      // Verify resend verification option
      await expect(page.locator('[data-testid="resend-verification"]')).toBeVisible();
    });
  });

  test.describe('Security Headers and CSRF Protection', () => {
    test('should include security headers', async ({ page }) => {
      const response = await page.goto('/');
      
      // Check for security headers
      const headers = response?.headers();
      expect(headers?.['x-frame-options']).toBeTruthy();
      expect(headers?.['x-content-type-options']).toBeTruthy();
      expect(headers?.['strict-transport-security']).toBeTruthy();
    });

    test('should handle CSRF protection', async ({ page }) => {
      await page.goto('/sign-in');
      
      // Mock CSRF token missing
      await page.route('**/api/auth/login', route => {
        route.fulfill({
          status: 403,
          body: JSON.stringify({ error: 'CSRF token missing' })
        });
      });
      
      // Fill and submit login form
      await fillForm(page, {
        identifier: TEST_ACCOUNTS.basicClient.email,
        password: TEST_ACCOUNTS.basicClient.password
      });
      
      await submitForm(page);
      
      // Verify CSRF error handling
      await expect(page.locator('text="Security error"')).toBeVisible();
    });
  });

  test.describe('Rate Limiting', () => {
    test('should handle login rate limiting', async ({ page }) => {
      await page.goto('/sign-in');
      
      // Mock rate limit response
      await page.route('**/api/auth/login', route => {
        route.fulfill({
          status: 429,
          body: JSON.stringify({ 
            error: 'Too many login attempts',
            retryAfter: 60
          })
        });
      });
      
      // Fill and submit login form
      await fillForm(page, {
        identifier: TEST_ACCOUNTS.basicClient.email,
        password: TEST_ACCOUNTS.basicClient.password
      });
      
      await submitForm(page);
      
      // Verify rate limit message
      await expect(page.locator('text="Too many login attempts"')).toBeVisible();
      
      // Verify retry information
      await expect(page.locator('text="Please wait 60 seconds"')).toBeVisible();
    });
  });
});