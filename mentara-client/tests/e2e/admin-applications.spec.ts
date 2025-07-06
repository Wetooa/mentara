import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { waitForApiCall, verifyLoadingState, verifyErrorState } from '../helpers/api';

test.describe('Admin Therapist Applications', () => {
  test.beforeEach(async ({ page }) => {
    // Login as super admin
    await loginAs(page, 'superAdmin');
  });

  test('should display therapist applications list', async ({ page }) => {
    // Navigate to applications page
    await page.goto('/admin/therapist-applications');
    
    // Wait for applications API call
    await waitForApiCall(page, '/api/therapist/application', 'GET');
    
    // Verify applications table is displayed
    await expect(page.locator('[data-testid="applications-table"]')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
    
    // Check table headers
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Provider Type")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Action")')).toBeVisible();
  });

  test('should handle loading state', async ({ page }) => {
    // Navigate to applications page
    await page.goto('/admin/therapist-applications');
    
    // Verify loading state appears and disappears
    await verifyLoadingState(page, '[data-testid="applications-loading"]');
    
    // Verify content is displayed after loading
    await expect(page.locator('[data-testid="applications-table"]')).toBeVisible();
  });

  test('should approve pending application', async ({ page }) => {
    // Navigate to applications page
    await page.goto('/admin/therapist-applications');
    await waitForApiCall(page, '/api/therapist/application', 'GET');
    
    // Look for pending applications
    const approveButton = page.locator('button:has-text("Approve")').first();
    
    if (await approveButton.isVisible()) {
      // Click approve button
      await approveButton.click();
      
      // Verify confirmation dialog appears
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Are you sure you want to approve')).toBeVisible();
      
      // Confirm approval
      const confirmButton = page.locator('button:has-text("Approve")').last();
      await confirmButton.click();
      
      // Wait for update API call
      await waitForApiCall(page, '/api/therapist/application/*', 'PUT');
      
      // Verify success message
      await expect(page.locator('text=Application approved successfully')).toBeVisible();
    }
  });

  test('should reject pending application', async ({ page }) => {
    // Navigate to applications page
    await page.goto('/admin/therapist-applications');
    await waitForApiCall(page, '/api/therapist/application', 'GET');
    
    // Look for pending applications
    const rejectButton = page.locator('button:has-text("Reject")').first();
    
    if (await rejectButton.isVisible()) {
      // Click reject button
      await rejectButton.click();
      
      // Verify confirmation dialog appears
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Are you sure you want to reject')).toBeVisible();
      
      // Confirm rejection
      const confirmButton = page.locator('button:has-text("Reject")').last();
      await confirmButton.click();
      
      // Wait for update API call
      await waitForApiCall(page, '/api/therapist/application/*', 'PUT');
      
      // Verify success message
      await expect(page.locator('text=Application rejected successfully')).toBeVisible();
    }
  });

  test('should view application details', async ({ page }) => {
    // Navigate to applications page
    await page.goto('/admin/therapist-applications');
    await waitForApiCall(page, '/api/therapist/application', 'GET');
    
    // Click on view button for first application
    const viewButton = page.locator('button:has-text("View")').first();
    
    if (await viewButton.isVisible()) {
      await viewButton.click();
      
      // Wait for application details API call
      await waitForApiCall(page, '/api/therapist/application/*', 'GET');
      
      // Verify application details page
      await expect(page.locator('[data-testid="application-details"]')).toBeVisible();
      
      // Check that key sections are present
      await expect(page.locator('[data-testid="personal-info"]')).toBeVisible();
      await expect(page.locator('[data-testid="professional-profile"]')).toBeVisible();
      await expect(page.locator('[data-testid="license-info"]')).toBeVisible();
    }
  });

  test('should filter applications by status', async ({ page }) => {
    // Navigate to applications page
    await page.goto('/admin/therapist-applications');
    await waitForApiCall(page, '/api/therapist/application', 'GET');
    
    // Look for status filter dropdown
    const statusFilter = page.locator('[data-testid="status-filter"]');
    
    if (await statusFilter.isVisible()) {
      // Select "pending" status
      await statusFilter.click();
      await page.locator('option[value="pending"], [data-value="pending"]').click();
      
      // Wait for filtered results API call
      await waitForApiCall(page, '/api/therapist/application', 'GET');
      
      // Verify that only pending applications are shown
      const statusBadges = page.locator('[data-testid="status-badge"]');
      const statusTexts = await statusBadges.allTextContents();
      
      if (statusTexts.length > 0) {
        statusTexts.forEach(text => {
          expect(text.toLowerCase()).toContain('pending');
        });
      }
    }
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/therapist/application**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Navigate to applications page
    await page.goto('/admin/therapist-applications');
    
    // Verify error state is displayed
    await verifyErrorState(page, 'Failed to load applications');
  });

  test('should search applications', async ({ page }) => {
    // Navigate to applications page
    await page.goto('/admin/therapist-applications');
    await waitForApiCall(page, '/api/therapist/application', 'GET');
    
    // Look for search input
    const searchInput = page.locator('[data-testid="applications-search"]');
    
    if (await searchInput.isVisible()) {
      // Search for a name
      await searchInput.fill('Dr. Smith');
      
      // Wait for search API call
      await waitForApiCall(page, '/api/therapist/application', 'GET');
      
      // Verify search results are filtered
      const applicationRows = page.locator('[data-testid="application-row"]');
      if (await applicationRows.count() > 0) {
        const names = await applicationRows.locator('[data-testid="applicant-name"]').allTextContents();
        names.forEach(name => {
          expect(name.toLowerCase()).toContain('smith');
        });
      }
    }
  });
});

test.describe('Application Details Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'superAdmin');
  });

  test('should display complete application information', async ({ page }) => {
    // Navigate directly to an application detail page (assuming an ID exists)
    await page.goto('/admin/therapist-applications/app-001');
    
    // Wait for application details API call
    await waitForApiCall(page, '/api/therapist/application/app-001', 'GET');
    
    // Verify all tabs are present
    await expect(page.locator('[data-testid="personal-info-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="professional-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="license-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="documents-tab"]')).toBeVisible();
    
    // Test tab navigation
    await page.locator('[data-testid="professional-tab"]').click();
    await expect(page.locator('[data-testid="professional-content"]')).toBeVisible();
    
    await page.locator('[data-testid="license-tab"]').click();
    await expect(page.locator('[data-testid="license-content"]')).toBeVisible();
  });

  test('should allow downloading documents', async ({ page }) => {
    // Navigate to application details
    await page.goto('/admin/therapist-applications/app-001');
    await waitForApiCall(page, '/api/therapist/application/app-001', 'GET');
    
    // Click on documents tab
    await page.locator('[data-testid="documents-tab"]').click();
    
    // Look for download buttons
    const downloadButton = page.locator('[data-testid="download-document"]').first();
    
    if (await downloadButton.isVisible()) {
      // Start download
      const downloadPromise = page.waitForEvent('download');
      await downloadButton.click();
      
      // Verify download starts
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBeTruthy();
    }
  });

  test('should update application status from details page', async ({ page }) => {
    // Navigate to application details
    await page.goto('/admin/therapist-applications/app-001');
    await waitForApiCall(page, '/api/therapist/application/app-001', 'GET');
    
    // Look for status update buttons
    const approveButton = page.locator('[data-testid="approve-application"]');
    
    if (await approveButton.isVisible()) {
      await approveButton.click();
      
      // Confirm in dialog
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await page.locator('button:has-text("Approve")').last().click();
      
      // Wait for update API call
      await waitForApiCall(page, '/api/therapist/application/app-001', 'PUT');
      
      // Verify success message and status update
      await expect(page.locator('text=Application approved successfully')).toBeVisible();
      await expect(page.locator('[data-testid="status-badge"]:has-text("Approved")')).toBeVisible();
    }
  });

  test('should add review notes', async ({ page }) => {
    // Navigate to application details
    await page.goto('/admin/therapist-applications/app-001');
    await waitForApiCall(page, '/api/therapist/application/app-001', 'GET');
    
    // Look for notes section
    const notesInput = page.locator('[data-testid="review-notes-input"]');
    
    if (await notesInput.isVisible()) {
      // Add review notes
      await notesInput.fill('Application reviewed - meets all requirements.');
      
      // Save notes
      const saveButton = page.locator('[data-testid="save-notes"]');
      await saveButton.click();
      
      // Wait for update API call
      await waitForApiCall(page, '/api/therapist/application/app-001', 'PUT');
      
      // Verify success message
      await expect(page.locator('text=Notes saved successfully')).toBeVisible();
    }
  });
});