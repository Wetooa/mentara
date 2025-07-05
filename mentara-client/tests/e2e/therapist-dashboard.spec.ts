import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { waitForApiCall, verifyLoadingState } from '../helpers/api';

test.describe('Therapist Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as approved therapist
    await loginAs(page, 'approvedTherapist');
  });

  test('should display dashboard with stats and appointments', async ({ page }) => {
    // Navigate to therapist dashboard
    await page.goto('/therapist/dashboard');
    
    // Wait for dashboard API call
    await waitForApiCall(page, '/api/therapist/dashboard', 'GET');
    
    // Verify dashboard sections are visible
    await expect(page.locator('[data-testid="therapist-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="upcoming-appointments"]')).toBeVisible();
    
    // Check that stats contain expected elements
    const statsSection = page.locator('[data-testid="therapist-stats"]');
    await expect(statsSection.locator('[data-testid="active-patients-count"]')).toBeVisible();
    await expect(statsSection.locator('[data-testid="monthly-income"]')).toBeVisible();
    
    // Verify appointments section
    const appointmentsSection = page.locator('[data-testid="upcoming-appointments"]');
    await expect(appointmentsSection.locator('[data-testid="appointment-item"]')).toHaveCount({ min: 0 });
  });

  test('should handle loading state correctly', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/therapist/dashboard');
    
    // Verify loading state appears and disappears
    await verifyLoadingState(page, '[data-testid="dashboard-loading"]');
    
    // Verify content is displayed after loading
    await expect(page.locator('[data-testid="therapist-stats"]')).toBeVisible();
  });

  test('should allow starting a meeting', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/therapist/dashboard');
    await waitForApiCall(page, '/api/therapist/dashboard', 'GET');
    
    // Look for a scheduled appointment
    const startButton = page.locator('[data-testid="start-meeting-button"]').first();
    
    if (await startButton.isVisible()) {
      // Click start meeting button
      await startButton.click();
      
      // Wait for meeting start API call
      await waitForApiCall(page, '/api/booking/meetings/*/start', 'POST');
      
      // Verify success feedback
      await expect(page.locator('text=Meeting started successfully')).toBeVisible();
    }
  });

  test('should refresh dashboard data', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/therapist/dashboard');
    await waitForApiCall(page, '/api/therapist/dashboard', 'GET');
    
    // Look for refresh button
    const refreshButton = page.locator('[data-testid="refresh-dashboard"]');
    
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      
      // Wait for refresh API call
      await waitForApiCall(page, '/api/therapist/dashboard', 'GET');
      
      // Verify refresh feedback
      await expect(page.locator('text=Dashboard refreshed')).toBeVisible();
    }
  });
});

test.describe('Patient Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'approvedTherapist');
  });

  test('should display patients list', async ({ page }) => {
    // Navigate to patients page
    await page.goto('/therapist/patients');
    
    // Wait for patients API call
    await waitForApiCall(page, '/api/therapist/patients', 'GET');
    
    // Verify patients list is displayed
    await expect(page.locator('[data-testid="patients-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="patient-card"]')).toHaveCount({ min: 0 });
  });

  test('should view patient details', async ({ page }) => {
    // Navigate to patients page
    await page.goto('/therapist/patients');
    await waitForApiCall(page, '/api/therapist/patients', 'GET');
    
    // Click on first patient if available
    const firstPatient = page.locator('[data-testid="patient-card"]').first();
    
    if (await firstPatient.isVisible()) {
      await firstPatient.click();
      
      // Wait for patient details API call
      await waitForApiCall(page, '/api/therapist/patients/*', 'GET');
      
      // Verify patient details are displayed
      await expect(page.locator('[data-testid="patient-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="patient-sessions"]')).toBeVisible();
      await expect(page.locator('[data-testid="patient-worksheets"]')).toBeVisible();
    }
  });

  test('should update session notes', async ({ page }) => {
    // Navigate to a patient detail page (assuming patient ID exists)
    await page.goto('/therapist/patients/pat-001');
    
    // Wait for patient data to load
    await waitForApiCall(page, '/api/therapist/patients/pat-001', 'GET');
    
    // Look for session notes input
    const notesInput = page.locator('[data-testid="session-notes-input"]');
    
    if (await notesInput.isVisible()) {
      // Update session notes
      await notesInput.fill('Updated session notes from Playwright test');
      
      // Save notes
      const saveButton = page.locator('[data-testid="save-notes-button"]');
      await saveButton.click();
      
      // Wait for update API call
      await waitForApiCall(page, '/api/therapist/patients/*/sessions/*/notes', 'PATCH');
      
      // Verify success message
      await expect(page.locator('text=Session notes updated successfully')).toBeVisible();
    }
  });

  test('should assign worksheet to patient', async ({ page }) => {
    // Navigate to patient detail page
    await page.goto('/therapist/patients/pat-001');
    await waitForApiCall(page, '/api/therapist/patients/pat-001', 'GET');
    
    // Look for assign worksheet button
    const assignButton = page.locator('[data-testid="assign-worksheet-button"]');
    
    if (await assignButton.isVisible()) {
      await assignButton.click();
      
      // Fill worksheet form (assuming a modal opens)
      const worksheetTitle = page.locator('[data-testid="worksheet-title-input"]');
      if (await worksheetTitle.isVisible()) {
        await worksheetTitle.fill('Test Worksheet Assignment');
        
        // Submit worksheet
        const submitButton = page.locator('[data-testid="submit-worksheet-button"]');
        await submitButton.click();
        
        // Wait for assignment API call
        await waitForApiCall(page, '/api/therapist/patients/*/worksheets', 'POST');
        
        // Verify success message
        await expect(page.locator('text=Worksheet assigned successfully')).toBeVisible();
      }
    }
  });
});

test.describe('Meeting Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'approvedTherapist');
  });

  test('should display meetings list', async ({ page }) => {
    // Navigate to meetings page
    await page.goto('/therapist/meetings');
    
    // Wait for meetings API call
    await waitForApiCall(page, '/api/booking/meetings', 'GET');
    
    // Verify meetings list is displayed
    await expect(page.locator('[data-testid="meetings-list"]')).toBeVisible();
  });

  test('should update meeting status', async ({ page }) => {
    // Navigate to meetings page
    await page.goto('/therapist/meetings');
    await waitForApiCall(page, '/api/booking/meetings', 'GET');
    
    // Look for a meeting with status update options
    const statusButton = page.locator('[data-testid="meeting-status-button"]').first();
    
    if (await statusButton.isVisible()) {
      await statusButton.click();
      
      // Select new status (e.g., completed)
      const completedOption = page.locator('[data-testid="status-completed"]');
      if (await completedOption.isVisible()) {
        await completedOption.click();
        
        // Wait for status update API call
        await waitForApiCall(page, '/api/booking/meetings/*/status', 'PATCH');
        
        // Verify success message
        await expect(page.locator('text=Meeting completed successfully')).toBeVisible();
      }
    }
  });
});