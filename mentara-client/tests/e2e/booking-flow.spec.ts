import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { navigateAndVerify, verifyCurrentPage, waitForPageLoad } from '../helpers/navigation';
import { fillForm, submitForm, selectFromDropdown, verifyFormSuccess } from '../helpers/forms';
import { waitForApiCall, verifyLoadingState } from '../helpers/api';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as complete client
    await loginAs(page, 'completeClient');
  });

  test('should book a session with recommended therapist', async ({ page }) => {
    // Navigate to therapist recommendations
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Click book session on first therapist
    const firstCard = page.locator('[data-testid="therapist-card"]').first();
    const bookButton = firstCard.locator('[data-testid="book-session-btn"]');
    
    await bookButton.click();
    
    // Verify booking modal opens
    await expect(page.locator('[data-testid="booking-modal"]')).toBeVisible();
    
    // Wait for available slots API call
    await waitForApiCall(page, '/api/booking/available-slots', 'GET');
    
    // Select date
    const dateButton = page.locator('[data-testid="date-slot"]').first();
    await dateButton.click();
    
    // Select time slot
    const timeButton = page.locator('[data-testid="time-slot"]').first();
    await timeButton.click();
    
    // Fill session details
    await fillForm(page, {
      sessionType: 'individual',
      sessionGoal: 'Initial consultation for anxiety management',
      additionalNotes: 'First time booking, feeling nervous but excited'
    });
    
    // Submit booking
    await submitForm(page);
    
    // Wait for booking API call
    await waitForApiCall(page, '/api/booking/sessions', 'POST');
    
    // Verify booking success
    await verifyFormSuccess(page, 'Session booked successfully');
    
    // Verify redirect to booking confirmation
    await verifyCurrentPage(page, '/user/booking/confirmation');
    
    // Verify booking details are displayed
    await expect(page.locator('[data-testid="booking-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="therapist-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="session-datetime"]')).toBeVisible();
    await expect(page.locator('[data-testid="session-type"]')).toBeVisible();
    
    // Verify calendar link
    await expect(page.locator('[data-testid="add-to-calendar"]')).toBeVisible();
    
    // Verify meeting join link (if session is soon)
    const joinButton = page.locator('[data-testid="join-meeting"]');
    if (await joinButton.isVisible()) {
      await expect(joinButton).toBeVisible();
    }
  });

  test('should handle different session types', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Start booking process
    await page.locator('[data-testid="therapist-card"]').first().locator('[data-testid="book-session-btn"]').click();
    await waitForApiCall(page, '/api/booking/available-slots', 'GET');
    
    // Select date and time
    await page.locator('[data-testid="date-slot"]').first().click();
    await page.locator('[data-testid="time-slot"]').first().click();
    
    // Test different session types
    const sessionTypes = ['individual', 'couples', 'group'];
    
    for (const sessionType of sessionTypes) {
      // Select session type
      await selectFromDropdown(page, '[data-testid="session-type"]', sessionType);
      
      // Verify session type specific fields appear
      if (sessionType === 'couples') {
        await expect(page.locator('[data-testid="partner-info"]')).toBeVisible();
      } else if (sessionType === 'group') {
        await expect(page.locator('[data-testid="group-size"]')).toBeVisible();
      }
    }
  });

  test('should handle recurring session booking', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Start booking process
    await page.locator('[data-testid="therapist-card"]').first().locator('[data-testid="book-session-btn"]').click();
    await waitForApiCall(page, '/api/booking/available-slots', 'GET');
    
    // Select date and time
    await page.locator('[data-testid="date-slot"]').first().click();
    await page.locator('[data-testid="time-slot"]').first().click();
    
    // Enable recurring sessions
    await page.locator('[data-testid="recurring-toggle"]').click();
    
    // Configure recurring settings
    await selectFromDropdown(page, '[data-testid="recurring-frequency"]', 'weekly');
    await selectFromDropdown(page, '[data-testid="recurring-duration"]', '8-weeks');
    
    // Fill session details
    await fillForm(page, {
      sessionType: 'individual',
      sessionGoal: 'Weekly therapy sessions for anxiety',
      additionalNotes: 'Looking for consistent weekly support'
    });
    
    // Submit booking
    await submitForm(page);
    
    // Wait for recurring booking API call
    await waitForApiCall(page, '/api/booking/sessions/recurring', 'POST');
    
    // Verify recurring booking success
    await verifyFormSuccess(page, 'Recurring sessions booked successfully');
    
    // Verify booking details show recurring information
    await expect(page.locator('[data-testid="recurring-details"]')).toBeVisible();
    await expect(page.locator('text="Weekly for 8 weeks"')).toBeVisible();
  });

  test('should handle session cancellation', async ({ page }) => {
    // Navigate to user dashboard first
    await navigateAndVerify(page, '/user');
    await waitForApiCall(page, '/api/users/dashboard', 'GET');
    
    // Navigate to upcoming sessions
    await page.locator('[data-testid="upcoming-sessions"]').click();
    
    // Find a session to cancel
    const sessionCard = page.locator('[data-testid="session-card"]').first();
    
    if (await sessionCard.isVisible()) {
      // Click cancel button
      await sessionCard.locator('[data-testid="cancel-session"]').click();
      
      // Verify cancellation modal
      await expect(page.locator('[data-testid="cancel-modal"]')).toBeVisible();
      
      // Select cancellation reason
      await selectFromDropdown(page, '[data-testid="cancel-reason"]', 'schedule-conflict');
      
      // Add cancellation note
      await fillForm(page, {
        cancellationNote: 'Unexpected work commitment came up'
      });
      
      // Confirm cancellation
      await page.locator('[data-testid="confirm-cancellation"]').click();
      
      // Wait for cancellation API call
      await waitForApiCall(page, '/api/booking/sessions/*/cancel', 'POST');
      
      // Verify cancellation success
      await verifyFormSuccess(page, 'Session cancelled successfully');
      
      // Verify session is removed from upcoming sessions
      await expect(sessionCard).not.toBeVisible();
    }
  });

  test('should handle session rescheduling', async ({ page }) => {
    await navigateAndVerify(page, '/user');
    await waitForApiCall(page, '/api/users/dashboard', 'GET');
    
    // Navigate to upcoming sessions
    await page.locator('[data-testid="upcoming-sessions"]').click();
    
    // Find a session to reschedule
    const sessionCard = page.locator('[data-testid="session-card"]').first();
    
    if (await sessionCard.isVisible()) {
      // Click reschedule button
      await sessionCard.locator('[data-testid="reschedule-session"]').click();
      
      // Verify reschedule modal
      await expect(page.locator('[data-testid="reschedule-modal"]')).toBeVisible();
      
      // Wait for available slots
      await waitForApiCall(page, '/api/booking/available-slots', 'GET');
      
      // Select new date and time
      await page.locator('[data-testid="date-slot"]').first().click();
      await page.locator('[data-testid="time-slot"]').first().click();
      
      // Add reschedule reason
      await fillForm(page, {
        rescheduleReason: 'Personal emergency came up'
      });
      
      // Confirm reschedule
      await page.locator('[data-testid="confirm-reschedule"]').click();
      
      // Wait for reschedule API call
      await waitForApiCall(page, '/api/booking/sessions/*/reschedule', 'POST');
      
      // Verify reschedule success
      await verifyFormSuccess(page, 'Session rescheduled successfully');
      
      // Verify session shows new time
      await expect(sessionCard.locator('[data-testid="session-datetime"]')).toBeVisible();
    }
  });

  test('should handle booking conflicts', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Start booking process
    await page.locator('[data-testid="therapist-card"]').first().locator('[data-testid="book-session-btn"]').click();
    await waitForApiCall(page, '/api/booking/available-slots', 'GET');
    
    // Mock API to return booking conflict
    await page.route('**/api/booking/sessions', route => {
      route.fulfill({
        status: 409,
        body: JSON.stringify({ 
          error: 'Time slot no longer available',
          code: 'BOOKING_CONFLICT'
        })
      });
    });
    
    // Select date and time
    await page.locator('[data-testid="date-slot"]').first().click();
    await page.locator('[data-testid="time-slot"]').first().click();
    
    // Fill and submit form
    await fillForm(page, {
      sessionType: 'individual',
      sessionGoal: 'Initial consultation'
    });
    
    await submitForm(page);
    
    // Verify conflict error message
    await expect(page.locator('text="Time slot no longer available"')).toBeVisible();
    
    // Verify user can select different time
    await expect(page.locator('[data-testid="select-different-time"]')).toBeVisible();
  });

  test('should handle payment processing', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Start booking process
    await page.locator('[data-testid="therapist-card"]').first().locator('[data-testid="book-session-btn"]').click();
    await waitForApiCall(page, '/api/booking/available-slots', 'GET');
    
    // Select date and time
    await page.locator('[data-testid="date-slot"]').first().click();
    await page.locator('[data-testid="time-slot"]').first().click();
    
    // Fill session details
    await fillForm(page, {
      sessionType: 'individual',
      sessionGoal: 'Initial consultation'
    });
    
    // Continue to payment
    await page.locator('[data-testid="continue-to-payment"]').click();
    
    // Verify payment form
    await expect(page.locator('[data-testid="payment-form"]')).toBeVisible();
    
    // Fill payment details (using test card)
    await fillForm(page, {
      cardNumber: '4242424242424242',
      expiryDate: '12/25',
      cvv: '123',
      cardholderName: 'John Doe'
    });
    
    // Process payment
    await page.locator('[data-testid="process-payment"]').click();
    
    // Wait for payment processing
    await waitForApiCall(page, '/api/booking/payment', 'POST');
    
    // Verify payment success
    await verifyFormSuccess(page, 'Payment processed successfully');
    
    // Verify booking is confirmed
    await expect(page.locator('[data-testid="booking-confirmed"]')).toBeVisible();
  });

  test('should handle insurance verification', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Start booking process
    await page.locator('[data-testid="therapist-card"]').first().locator('[data-testid="book-session-btn"]').click();
    await waitForApiCall(page, '/api/booking/available-slots', 'GET');
    
    // Select date and time
    await page.locator('[data-testid="date-slot"]').first().click();
    await page.locator('[data-testid="time-slot"]').first().click();
    
    // Select insurance payment option
    await selectFromDropdown(page, '[data-testid="payment-method"]', 'insurance');
    
    // Verify insurance form appears
    await expect(page.locator('[data-testid="insurance-form"]')).toBeVisible();
    
    // Fill insurance details
    await fillForm(page, {
      insuranceProvider: 'Blue Cross',
      memberId: '12345678',
      groupNumber: 'GRP123'
    });
    
    // Verify insurance
    await page.locator('[data-testid="verify-insurance"]').click();
    
    // Wait for insurance verification
    await waitForApiCall(page, '/api/booking/insurance/verify', 'POST');
    
    // Verify insurance status
    await expect(page.locator('[data-testid="insurance-status"]')).toBeVisible();
  });

  test('should handle emergency booking', async ({ page }) => {
    await navigateAndVerify(page, '/user/booking');
    
    // Click emergency booking
    await page.locator('[data-testid="emergency-booking"]').click();
    
    // Verify emergency booking modal
    await expect(page.locator('[data-testid="emergency-modal"]')).toBeVisible();
    
    // Fill emergency details
    await fillForm(page, {
      urgencyLevel: 'high',
      situation: 'Experiencing severe anxiety attack',
      preferredContact: 'phone'
    });
    
    // Submit emergency request
    await submitForm(page);
    
    // Wait for emergency booking API call
    await waitForApiCall(page, '/api/booking/emergency', 'POST');
    
    // Verify emergency booking confirmation
    await verifyFormSuccess(page, 'Emergency booking submitted');
    
    // Verify next steps are displayed
    await expect(page.locator('[data-testid="emergency-next-steps"]')).toBeVisible();
  });

  test('should handle mobile booking experience', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Start mobile booking
    await page.locator('[data-testid="therapist-card"]').first().locator('[data-testid="book-session-btn"]').click();
    
    // Verify mobile booking interface
    await expect(page.locator('[data-testid="mobile-booking-modal"]')).toBeVisible();
    
    // Test mobile calendar interaction
    await page.locator('[data-testid="mobile-date-picker"]').click();
    await page.locator('[data-testid="date-slot"]').first().click();
    
    // Test mobile time selection
    await page.locator('[data-testid="mobile-time-picker"]').click();
    await page.locator('[data-testid="time-slot"]').first().click();
    
    // Fill mobile form
    await fillForm(page, {
      sessionType: 'individual',
      sessionGoal: 'Mobile booking test'
    });
    
    // Submit mobile booking
    await submitForm(page);
    
    // Wait for booking API call
    await waitForApiCall(page, '/api/booking/sessions', 'POST');
    
    // Verify mobile booking success
    await verifyFormSuccess(page, 'Session booked successfully');
  });

  test('should handle booking for different timezones', async ({ page }) => {
    await navigateAndVerify(page, '/user/therapist');
    await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
    
    // Start booking process
    await page.locator('[data-testid="therapist-card"]').first().locator('[data-testid="book-session-btn"]').click();
    await waitForApiCall(page, '/api/booking/available-slots', 'GET');
    
    // Change timezone
    await page.locator('[data-testid="timezone-selector"]').click();
    await page.locator('[data-testid="timezone-est"]').click();
    
    // Verify times are updated for new timezone
    await expect(page.locator('[data-testid="timezone-indicator"]')).toContainText('EST');
    
    // Select date and time
    await page.locator('[data-testid="date-slot"]').first().click();
    await page.locator('[data-testid="time-slot"]').first().click();
    
    // Verify timezone is displayed in booking summary
    await expect(page.locator('[data-testid="booking-timezone"]')).toContainText('EST');
    
    // Complete booking
    await fillForm(page, {
      sessionType: 'individual',
      sessionGoal: 'Timezone test booking'
    });
    
    await submitForm(page);
    
    // Wait for booking API call
    await waitForApiCall(page, '/api/booking/sessions', 'POST');
    
    // Verify booking success with correct timezone
    await verifyFormSuccess(page, 'Session booked successfully');
  });
});