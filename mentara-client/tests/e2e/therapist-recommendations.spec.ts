import { test, expect } from '@playwright/test';
import { loginAs, TEST_ACCOUNTS } from '../helpers/auth';
import { waitForApiCall, verifyLoadingState } from '../helpers/api';

test.describe('Therapist Recommendations', () => {
  test.beforeEach(async ({ page }) => {
    // Login as basic client to test therapist recommendations
    await loginAs(page, 'basicClient');
  });

  test('should display therapist recommendations', async ({ page }) => {
    // Navigate to therapist recommendations page
    await page.goto('/user/therapist-recommendations');
    
    // Wait for the API call to load recommendations
    await waitForApiCall(page, '/api/therapist-recommendations', 'GET');
    
    // Verify that recommendations are displayed
    await expect(page.locator('[data-testid="therapist-recommendations"]')).toBeVisible();
    
    // Check that at least one therapist card is shown
    await expect(page.locator('[data-testid="therapist-card"]')).toHaveCount({ min: 1 });
    
    // Verify therapist card contains required information
    const firstCard = page.locator('[data-testid="therapist-card"]').first();
    await expect(firstCard.locator('[data-testid="therapist-name"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="therapist-specialties"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="therapist-rating"]')).toBeVisible();
  });

  test('should handle loading state', async ({ page }) => {
    // Navigate to therapist recommendations page
    await page.goto('/user/therapist-recommendations');
    
    // Verify loading state appears and disappears
    await verifyLoadingState(page, '[data-testid="recommendations-loading"]');
    
    // Verify content is displayed after loading
    await expect(page.locator('[data-testid="therapist-recommendations"]')).toBeVisible();
  });

  test('should handle search and filtering', async ({ page }) => {
    // Navigate to therapist recommendations page
    await page.goto('/user/therapist-recommendations');
    
    // Wait for initial load
    await waitForApiCall(page, '/api/therapist-recommendations', 'GET');
    
    // Test search functionality
    const searchInput = page.locator('[data-testid="therapist-search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('anxiety');
      
      // Wait for search API call
      await waitForApiCall(page, '/api/therapist-recommendations', 'GET');
      
      // Verify filtered results
      await expect(page.locator('[data-testid="therapist-card"]')).toHaveCount({ min: 1 });
    }
  });

  test('should handle error state gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/therapist-recommendations**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Navigate to page
    await page.goto('/user/therapist-recommendations');
    
    // Verify error state is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('error');
  });
});

test.describe('Therapist Profile View', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'basicClient');
  });

  test('should display detailed therapist profile', async ({ page }) => {
    // Navigate to therapist recommendations first
    await page.goto('/user/therapist-recommendations');
    await waitForApiCall(page, '/api/therapist-recommendations', 'GET');
    
    // Click on first therapist card to view profile
    await page.locator('[data-testid="therapist-card"]').first().click();
    
    // Wait for profile API call
    await waitForApiCall(page, '/api/therapists/', 'GET');
    
    // Verify profile details are displayed
    await expect(page.locator('[data-testid="therapist-profile"]')).toBeVisible();
    await expect(page.locator('[data-testid="therapist-bio"]')).toBeVisible();
    await expect(page.locator('[data-testid="therapist-specialties-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="book-session-button"]')).toBeVisible();
  });
});