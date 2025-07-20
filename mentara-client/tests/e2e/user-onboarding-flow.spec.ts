import { test, expect } from '@playwright/test';
import { loginAs, setupAuthenticatedPage } from '../helpers/auth';
import { navigateAndVerify, verifyCurrentPage, waitForPageLoad } from '../helpers/navigation';
import { fillForm, submitForm, verifyFormSuccess, navigateFormStep, verifyFormStep } from '../helpers/forms';
import { waitForApiCall, verifyLoadingState } from '../helpers/api';

test.describe('User Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as basic client (not yet onboarded)
    await loginAs(page, 'basicClient');
  });

  test('should complete full onboarding flow', async ({ page }) => {
    // Navigate to onboarding
    await navigateAndVerify(page, '/user/onboarding');
    
    // Verify we're on the onboarding page
    await expect(page.locator('[data-testid="onboarding-container"]')).toBeVisible();
    
    // Step 1: Profile Information
    await verifyFormStep(page, 1, 4);
    
    await fillForm(page, {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      phoneNumber: '+1234567890',
      province: 'Ontario',
      emergencyContact: 'Jane Doe',
      emergencyPhone: '+1234567891'
    });
    
    await navigateFormStep(page, 'next');
    
    // Wait for profile update API call
    await waitForApiCall(page, '/api/users/profile', 'PUT');
    
    // Step 2: Goals Setting
    await verifyFormStep(page, 2, 4);
    
    // Select goals
    await page.locator('[data-testid="goal-anxiety"]').click();
    await page.locator('[data-testid="goal-depression"]').click();
    await page.locator('[data-testid="goal-stress"]').click();
    
    // Set priority
    await page.locator('[data-testid="priority-high"]').click();
    
    // Fill additional details
    await fillForm(page, {
      currentChallenges: 'Dealing with work-related stress and anxiety',
      previousTherapy: 'yes',
      therapyDetails: 'Had CBT sessions 2 years ago',
      medications: 'Sertraline 50mg daily',
      additionalNotes: 'Prefer evening sessions'
    });
    
    await navigateFormStep(page, 'next');
    
    // Wait for goals update API call
    await waitForApiCall(page, '/api/users/goals', 'PUT');
    
    // Step 3: Therapist Preferences
    await verifyFormStep(page, 3, 4);
    
    // Select therapist preferences
    await page.locator('[data-testid="gender-preference-no-preference"]').click();
    await page.locator('[data-testid="age-preference-30-40"]').click();
    await page.locator('[data-testid="approach-cbt"]').click();
    await page.locator('[data-testid="approach-mindfulness"]').click();
    
    // Session preferences
    await fillForm(page, {
      sessionFrequency: 'weekly',
      sessionDuration: '60',
      preferredTimes: 'evening',
      communicationStyle: 'direct',
      specificRequests: 'Experience with anxiety disorders'
    });
    
    await navigateFormStep(page, 'next');
    
    // Wait for preferences update API call
    await waitForApiCall(page, '/api/users/therapist-preferences', 'PUT');
    
    // Step 4: Review and Complete
    await verifyFormStep(page, 4, 4);
    
    // Verify summary information is displayed
    await expect(page.locator('[data-testid="profile-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="goals-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="preferences-summary"]')).toBeVisible();
    
    // Complete onboarding
    await submitForm(page);
    
    // Wait for completion API call
    await waitForApiCall(page, '/api/users/onboarding/complete', 'POST');
    
    // Verify redirect to success page
    await verifyCurrentPage(page, '/user/onboarding/complete');
    
    // Verify success message
    await expect(page.locator('text="Onboarding completed successfully"')).toBeVisible();
    
    // Verify continue button
    const continueButton = page.locator('[data-testid="continue-to-dashboard"]');
    await expect(continueButton).toBeVisible();
    await continueButton.click();
    
    // Verify redirect to user dashboard
    await verifyCurrentPage(page, '/user');
    
    // Verify dashboard shows onboarded state
    await expect(page.locator('[data-testid="onboarded-welcome"]')).toBeVisible();
  });

  test('should handle form validation errors', async ({ page }) => {
    await navigateAndVerify(page, '/user/onboarding');
    
    // Try to proceed without filling required fields
    await navigateFormStep(page, 'next');
    
    // Verify validation errors
    await expect(page.locator('text="First name is required"')).toBeVisible();
    await expect(page.locator('text="Last name is required"')).toBeVisible();
    await expect(page.locator('text="Date of birth is required"')).toBeVisible();
    
    // Fill some fields correctly
    await fillForm(page, {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '2010-01-01' // Too young
    });
    
    await navigateFormStep(page, 'next');
    
    // Verify age validation
    await expect(page.locator('text="Must be at least 18 years old"')).toBeVisible();
  });

  test('should allow editing previous steps', async ({ page }) => {
    await navigateAndVerify(page, '/user/onboarding');
    
    // Complete step 1
    await fillForm(page, {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      phoneNumber: '+1234567890'
    });
    
    await navigateFormStep(page, 'next');
    
    // Go back to step 1
    await navigateFormStep(page, 'previous');
    
    // Verify we're back on step 1
    await verifyFormStep(page, 1, 4);
    
    // Verify fields are still filled
    await expect(page.locator('[name="firstName"]')).toHaveValue('John');
    
    // Edit a field
    await page.locator('[name="firstName"]').fill('Jane');
    
    // Proceed to step 2
    await navigateFormStep(page, 'next');
    
    // Verify the change was saved
    await expect(page.locator('[data-testid="profile-summary"]')).toContainText('Jane');
  });

  test('should handle auto-save functionality', async ({ page }) => {
    await navigateAndVerify(page, '/user/onboarding');
    
    // Fill a field
    await page.locator('[name="firstName"]').fill('John');
    
    // Verify auto-save indicator appears
    await expect(page.locator('[data-testid="auto-save-indicator"]')).toBeVisible();
    
    // Wait for auto-save to complete
    await expect(page.locator('[data-testid="auto-save-indicator"]')).toBeHidden();
    
    // Refresh page
    await page.reload();
    await waitForPageLoad(page);
    
    // Verify data was saved
    await expect(page.locator('[name="firstName"]')).toHaveValue('John');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/users/profile', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await navigateAndVerify(page, '/user/onboarding');
    
    // Fill form
    await fillForm(page, {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01'
    });
    
    // Try to proceed
    await navigateFormStep(page, 'next');
    
    // Verify error message is shown
    await expect(page.locator('text="Failed to save profile information"')).toBeVisible();
    
    // Verify user stays on current step
    await verifyFormStep(page, 1, 4);
  });

  test('should skip onboarding if already completed', async ({ page }) => {
    // Login as complete client (already onboarded)
    await loginAs(page, 'completeClient');
    
    // Try to access onboarding
    await page.goto('/user/onboarding');
    
    // Verify redirect to dashboard
    await verifyCurrentPage(page, '/user');
    
    // Verify no onboarding content
    await expect(page.locator('[data-testid="onboarding-container"]')).not.toBeVisible();
  });

  test('should handle session timeout during onboarding', async ({ page }) => {
    await navigateAndVerify(page, '/user/onboarding');
    
    // Fill some form data
    await fillForm(page, {
      firstName: 'John',
      lastName: 'Doe'
    });
    
    // Mock session timeout
    await page.route('**/api/users/profile', route => {
      route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Session expired' })
      });
    });
    
    // Try to proceed
    await navigateFormStep(page, 'next');
    
    // Verify redirect to login
    await verifyCurrentPage(page, '/sign-in');
    
    // Verify session timeout message
    await expect(page.locator('text="Session expired"')).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await navigateAndVerify(page, '/user/onboarding');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('[name="firstName"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[name="lastName"]')).toBeFocused();
    
    // Test form submission with Enter
    await page.locator('[name="firstName"]').fill('John');
    await page.locator('[name="lastName"]').fill('Doe');
    await page.locator('[name="dateOfBirth"]').fill('1990-01-01');
    
    // Focus on next button and press Enter
    await page.locator('[data-testid="next-step"]').focus();
    await page.keyboard.press('Enter');
    
    // Verify navigation to step 2
    await verifyFormStep(page, 2, 4);
  });

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await navigateAndVerify(page, '/user/onboarding');
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-stepper"]')).toBeVisible();
    
    // Verify form fields are properly sized
    const firstNameField = page.locator('[name="firstName"]');
    const fieldBox = await firstNameField.boundingBox();
    expect(fieldBox?.width).toBeLessThan(400);
    
    // Test mobile form navigation
    await fillForm(page, {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01'
    });
    
    // Test mobile next button
    await page.locator('[data-testid="mobile-next"]').click();
    await verifyFormStep(page, 2, 4);
  });
});