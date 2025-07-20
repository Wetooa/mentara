import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { navigateAndVerify, verifyCurrentPage, waitForPageLoad } from '../helpers/navigation';
import { fillForm, submitForm, selectFromDropdown, toggleCheckbox } from '../helpers/forms';
import { waitForApiCall, verifyLoadingState, verifyEmptyState } from '../helpers/api';

test.describe('Therapist Recommendation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as complete client (onboarded)
    await loginAs(page, 'completeClient');
  });

  test('should display personalized therapist recommendations', async ({ page }) => {
    // Navigate to therapist recommendations
    await navigateAndVerify(page, '/user/therapist');
    
    // Wait for recommendations API call
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Verify recommendations section is visible
    await expect(page.locator('[data-testid="recommendations-section"]')).toBeVisible();
    
    // Verify at least one recommendation card
    await expect(page.locator('[data-testid="therapist-card"]')).toHaveCount({ min: 1 });
    
    // Verify recommendation cards contain essential information
    const firstCard = page.locator('[data-testid="therapist-card"]').first();
    await expect(firstCard.locator('[data-testid="therapist-name"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="therapist-specialization"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="therapist-rating"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="therapist-availability"]')).toBeVisible();
    
    // Verify match percentage is displayed
    await expect(firstCard.locator('[data-testid="match-percentage"]')).toBeVisible();
    
    // Verify action buttons
    await expect(firstCard.locator('[data-testid="view-profile-btn"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="book-session-btn"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="favorite-btn"]')).toBeVisible();
  });

  test('should filter therapists by specialization', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Open filters
    await page.locator('[data-testid="filter-toggle"]').click();
    await expect(page.locator('[data-testid="filters-panel"]')).toBeVisible();
    
    // Select anxiety specialization
    await toggleCheckbox(page, '[data-testid="filter-anxiety"]', true);
    
    // Apply filters
    await page.locator('[data-testid="apply-filters"]').click();
    
    // Wait for filtered results
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Verify all displayed therapists have anxiety specialization
    const therapistCards = page.locator('[data-testid="therapist-card"]');
    const cardCount = await therapistCards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = therapistCards.nth(i);
      await expect(card.locator('[data-testid="therapist-specialization"]')).toContainText('Anxiety');
    }
    
    // Verify filter is active
    await expect(page.locator('[data-testid="active-filter-anxiety"]')).toBeVisible();
  });

  test('should filter therapists by availability', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Open filters
    await page.locator('[data-testid="filter-toggle"]').click();
    
    // Select availability filter
    await selectFromDropdown(page, '[data-testid="availability-filter"]', 'this-week');
    
    // Apply filters
    await page.locator('[data-testid="apply-filters"]').click();
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Verify all therapists show availability this week
    const therapistCards = page.locator('[data-testid="therapist-card"]');
    const cardCount = await therapistCards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = therapistCards.nth(i);
      await expect(card.locator('[data-testid="therapist-availability"]')).toContainText('Available');
    }
  });

  test('should filter therapists by price range', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Open filters
    await page.locator('[data-testid="filter-toggle"]').click();
    
    // Set price range
    const priceSlider = page.locator('[data-testid="price-range-slider"]');
    await priceSlider.click(); // This would set a specific price range
    
    // Apply filters
    await page.locator('[data-testid="apply-filters"]').click();
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Verify filtered results
    await expect(page.locator('[data-testid="therapist-card"]')).toHaveCount({ min: 1 });
  });

  test('should view detailed therapist profile', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Click on first therapist's profile
    await page.locator('[data-testid="therapist-card"]').first().locator('[data-testid="view-profile-btn"]').click();
    
    // Verify profile modal/page opens
    await expect(page.locator('[data-testid="therapist-profile-modal"]')).toBeVisible();
    
    // Wait for profile API call
    await waitForApiCall(page, '/api/therapists/*/profile', 'GET');
    
    // Verify profile details
    await expect(page.locator('[data-testid="therapist-bio"]')).toBeVisible();
    await expect(page.locator('[data-testid="therapist-education"]')).toBeVisible();
    await expect(page.locator('[data-testid="therapist-experience"]')).toBeVisible();
    await expect(page.locator('[data-testid="therapist-approach"]')).toBeVisible();
    await expect(page.locator('[data-testid="therapist-availability-calendar"]')).toBeVisible();
    
    // Verify reviews section
    await expect(page.locator('[data-testid="therapist-reviews"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-item"]')).toHaveCount({ min: 0 });
    
    // Verify action buttons in modal
    await expect(page.locator('[data-testid="book-session-modal-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="favorite-modal-btn"]')).toBeVisible();
  });

  test('should add therapist to favorites', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Click favorite button on first therapist
    const firstCard = page.locator('[data-testid="therapist-card"]').first();
    const favoriteBtn = firstCard.locator('[data-testid="favorite-btn"]');
    
    await favoriteBtn.click();
    
    // Wait for favorite API call
    await waitForApiCall(page, '/api/therapists/*/favorite', 'POST');
    
    // Verify favorite state change
    await expect(favoriteBtn).toHaveClass(/favorited/);
    
    // Verify success message
    await expect(page.locator('text="Added to favorites"')).toBeVisible();
    
    // Navigate to favorites page
    await page.locator('[data-testid="favorites-tab"]').click();
    
    // Verify therapist appears in favorites
    await expect(page.locator('[data-testid="favorite-therapist-card"]')).toHaveCount({ min: 1 });
  });

  test('should remove therapist from favorites', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // First add to favorites
    const firstCard = page.locator('[data-testid="therapist-card"]').first();
    const favoriteBtn = firstCard.locator('[data-testid="favorite-btn"]');
    
    await favoriteBtn.click();
    await waitForApiCall(page, '/api/therapists/*/favorite', 'POST');
    
    // Click favorite button again to remove
    await favoriteBtn.click();
    
    // Wait for unfavorite API call
    await waitForApiCall(page, '/api/therapists/*/favorite', 'DELETE');
    
    // Verify favorite state change
    await expect(favoriteBtn).not.toHaveClass(/favorited/);
    
    // Verify success message
    await expect(page.locator('text="Removed from favorites"')).toBeVisible();
  });

  test('should search for specific therapists', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Use search functionality
    const searchInput = page.locator('[data-testid="therapist-search"]');
    await searchInput.fill('Dr. Smith');
    
    // Wait for search results
    await waitForApiCall(page, '/api/therapists/search', 'GET');
    
    // Verify search results
    await expect(page.locator('[data-testid="therapist-card"]')).toHaveCount({ min: 0 });
    
    // If results exist, verify they match search term
    const resultsCount = await page.locator('[data-testid="therapist-card"]').count();
    if (resultsCount > 0) {
      await expect(page.locator('[data-testid="therapist-name"]').first()).toContainText('Smith');
    }
  });

  test('should handle empty search results', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Search for non-existent therapist
    const searchInput = page.locator('[data-testid="therapist-search"]');
    await searchInput.fill('NonExistentTherapist123');
    
    // Wait for search results
    await waitForApiCall(page, '/api/therapists/search', 'GET');
    
    // Verify empty state
    await verifyEmptyState(page, 'No therapists found matching your search');
    
    // Verify suggestions are shown
    await expect(page.locator('[data-testid="search-suggestions"]')).toBeVisible();
  });

  test('should sort therapists by different criteria', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Open sort options
    await page.locator('[data-testid="sort-dropdown"]').click();
    
    // Sort by rating
    await page.locator('[data-testid="sort-rating"]').click();
    
    // Wait for sorted results
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Verify sorting (check that ratings are in descending order)
    const ratingElements = page.locator('[data-testid="therapist-rating"]');
    const ratings = await ratingElements.allTextContents();
    
    // Convert to numbers and verify descending order
    const numericRatings = ratings.map(r => parseFloat(r.replace(/[^0-9.]/g, '')));
    for (let i = 0; i < numericRatings.length - 1; i++) {
      expect(numericRatings[i]).toBeGreaterThanOrEqual(numericRatings[i + 1]);
    }
  });

  test('should handle loading states during filtering', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Open filters
    await page.locator('[data-testid="filter-toggle"]').click();
    
    // Apply a filter
    await toggleCheckbox(page, '[data-testid="filter-anxiety"]', true);
    await page.locator('[data-testid="apply-filters"]').click();
    
    // Verify loading state
    await verifyLoadingState(page, '[data-testid="therapist-list-loading"]');
    
    // Verify content loads after loading
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    await expect(page.locator('[data-testid="therapist-card"]')).toHaveCount({ min: 0 });
  });

  test('should clear all filters', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Get initial count
    const initialCount = await page.locator('[data-testid="therapist-card"]').count();
    
    // Apply multiple filters
    await page.locator('[data-testid="filter-toggle"]').click();
    await toggleCheckbox(page, '[data-testid="filter-anxiety"]', true);
    await toggleCheckbox(page, '[data-testid="filter-depression"]', true);
    await page.locator('[data-testid="apply-filters"]').click();
    
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Verify filtered results
    const filteredCount = await page.locator('[data-testid="therapist-card"]').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    
    // Clear all filters
    await page.locator('[data-testid="clear-filters"]').click();
    
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Verify all therapists are shown again
    const clearedCount = await page.locator('[data-testid="therapist-card"]').count();
    expect(clearedCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/therapists/recommendations', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await navigateAndVerify(page, '/user/therapist');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('text="Failed to load therapist recommendations"')).toBeVisible();
    
    // Verify retry button
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('should support pagination', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Check if pagination is present
    const paginationContainer = page.locator('[data-testid="pagination"]');
    
    if (await paginationContainer.isVisible()) {
      // Click next page
      await page.locator('[data-testid="next-page"]').click();
      
      // Wait for next page data
      await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
      
      // Verify page changed
      await expect(page.locator('[data-testid="current-page"]')).toContainText('2');
      
      // Verify new therapists are loaded
      await expect(page.locator('[data-testid="therapist-card"]')).toHaveCount({ min: 1 });
    }
  });

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-therapist-list"]')).toBeVisible();
    
    // Verify mobile filters are accessible
    await page.locator('[data-testid="mobile-filter-toggle"]').click();
    await expect(page.locator('[data-testid="mobile-filters-drawer"]')).toBeVisible();
    
    // Verify cards are properly sized for mobile
    const firstCard = page.locator('[data-testid="therapist-card"]').first();
    const cardBox = await firstCard.boundingBox();
    expect(cardBox?.width).toBeLessThan(400);
  });
});