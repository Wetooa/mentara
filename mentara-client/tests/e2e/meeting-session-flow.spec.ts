import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { navigateAndVerify, verifyCurrentPage, waitForPageLoad } from '../helpers/navigation';
import { fillForm, submitForm, verifyFormSuccess } from '../helpers/forms';
import { waitForApiCall, verifyLoadingState } from '../helpers/api';

test.describe('Meeting and Session Flow', () => {
  test.describe('Client Meeting Experience', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'completeClient');
    });

    test('should join a scheduled meeting', async ({ page }) => {
      // Navigate to dashboard
      await navigateAndVerify(page, '/user');
      await waitForApiCall(page, '/api/users/dashboard', 'GET');
      
      // Find upcoming session
      const upcomingSession = page.locator('[data-testid="upcoming-session"]').first();
      
      if (await upcomingSession.isVisible()) {
        // Click join meeting button
        await upcomingSession.locator('[data-testid="join-meeting"]').click();
        
        // Wait for meeting room to load
        await waitForApiCall(page, '/api/meetings/*/join', 'POST');
        
        // Verify meeting room page
        await verifyCurrentPage(page, /\/meeting\/[^\/]+/);
        
        // Verify meeting room interface
        await expect(page.locator('[data-testid="meeting-room"]')).toBeVisible();
        await expect(page.locator('[data-testid="video-container"]')).toBeVisible();
        await expect(page.locator('[data-testid="chat-panel"]')).toBeVisible();
        await expect(page.locator('[data-testid="meeting-controls"]')).toBeVisible();
      }
    });

    test('should handle pre-meeting setup', async ({ page }) => {
      // Navigate to a meeting room
      await page.goto('/meeting/test-meeting-id');
      
      // Verify pre-meeting setup screen
      await expect(page.locator('[data-testid="pre-meeting-setup"]')).toBeVisible();
      
      // Test camera and microphone permissions
      await page.locator('[data-testid="test-camera"]').click();
      await expect(page.locator('[data-testid="camera-preview"]')).toBeVisible();
      
      await page.locator('[data-testid="test-microphone"]').click();
      await expect(page.locator('[data-testid="microphone-level"]')).toBeVisible();
      
      // Test audio/video settings
      await page.locator('[data-testid="camera-toggle"]').click();
      await expect(page.locator('[data-testid="camera-off"]')).toBeVisible();
      
      await page.locator('[data-testid="microphone-toggle"]').click();
      await expect(page.locator('[data-testid="microphone-off"]')).toBeVisible();
      
      // Join meeting
      await page.locator('[data-testid="join-meeting-button"]').click();
      
      // Wait for meeting to start
      await waitForApiCall(page, '/api/meetings/*/start', 'POST');
      
      // Verify meeting started
      await expect(page.locator('[data-testid="meeting-active"]')).toBeVisible();
    });

    test('should handle meeting controls', async ({ page }) => {
      // Navigate to active meeting
      await page.goto('/meeting/test-meeting-id');
      
      // Mock meeting as active
      await page.route('**/api/meetings/*/status', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ status: 'active' })
        });
      });
      
      await waitForPageLoad(page);
      
      // Test camera toggle
      await page.locator('[data-testid="camera-toggle"]').click();
      await expect(page.locator('[data-testid="camera-off-indicator"]')).toBeVisible();
      
      // Test microphone toggle
      await page.locator('[data-testid="microphone-toggle"]').click();
      await expect(page.locator('[data-testid="microphone-off-indicator"]')).toBeVisible();
      
      // Test screen share
      await page.locator('[data-testid="screen-share"]').click();
      await expect(page.locator('[data-testid="screen-share-active"]')).toBeVisible();
      
      // Test chat
      await page.locator('[data-testid="chat-toggle"]').click();
      await expect(page.locator('[data-testid="chat-panel"]')).toBeVisible();
      
      // Send chat message
      await fillForm(page, {
        chatMessage: 'Hello from the client!'
      });
      
      await page.locator('[data-testid="send-message"]').click();
      
      // Verify message sent
      await expect(page.locator('[data-testid="chat-message"]')).toContainText('Hello from the client!');
      
      // Test meeting recording
      await page.locator('[data-testid="record-toggle"]').click();
      await expect(page.locator('[data-testid="recording-indicator"]')).toBeVisible();
    });

    test('should handle meeting end', async ({ page }) => {
      // Navigate to active meeting
      await page.goto('/meeting/test-meeting-id');
      await waitForPageLoad(page);
      
      // End meeting
      await page.locator('[data-testid="end-meeting"]').click();
      
      // Confirm end meeting
      await expect(page.locator('[data-testid="end-meeting-modal"]')).toBeVisible();
      await page.locator('[data-testid="confirm-end-meeting"]').click();
      
      // Wait for meeting end API call
      await waitForApiCall(page, '/api/meetings/*/end', 'POST');
      
      // Verify meeting ended
      await expect(page.locator('[data-testid="meeting-ended"]')).toBeVisible();
      
      // Verify post-meeting options
      await expect(page.locator('[data-testid="session-notes"]')).toBeVisible();
      await expect(page.locator('[data-testid="book-next-session"]')).toBeVisible();
      await expect(page.locator('[data-testid="rate-session"]')).toBeVisible();
      
      // Rate the session
      await page.locator('[data-testid="rating-5"]').click();
      await fillForm(page, {
        sessionFeedback: 'Great session, very helpful!'
      });
      
      await page.locator('[data-testid="submit-rating"]').click();
      
      // Wait for rating submission
      await waitForApiCall(page, '/api/sessions/*/rating', 'POST');
      
      // Verify rating submitted
      await verifyFormSuccess(page, 'Thank you for your feedback');
    });

    test('should handle connection issues', async ({ page }) => {
      // Navigate to meeting
      await page.goto('/meeting/test-meeting-id');
      await waitForPageLoad(page);
      
      // Mock connection issues
      await page.route('**/api/meetings/*/heartbeat', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Connection failed' })
        });
      });
      
      // Verify connection warning
      await expect(page.locator('[data-testid="connection-warning"]')).toBeVisible();
      
      // Verify reconnection attempts
      await expect(page.locator('[data-testid="reconnecting"]')).toBeVisible();
      
      // Test manual reconnection
      await page.locator('[data-testid="reconnect-button"]').click();
      
      // Verify reconnection attempt
      await expect(page.locator('[data-testid="reconnecting"]')).toBeVisible();
    });

    test('should handle early arrival', async ({ page }) => {
      // Navigate to meeting 10 minutes early
      await page.goto('/meeting/test-meeting-id');
      
      // Mock meeting not yet started
      await page.route('**/api/meetings/*/status', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ 
            status: 'scheduled',
            startTime: '2024-01-01T10:00:00Z'
          })
        });
      });
      
      await waitForPageLoad(page);
      
      // Verify waiting room
      await expect(page.locator('[data-testid="waiting-room"]')).toBeVisible();
      await expect(page.locator('[data-testid="waiting-message"]')).toContainText('The therapist will join shortly');
      
      // Verify countdown timer
      await expect(page.locator('[data-testid="countdown-timer"]')).toBeVisible();
      
      // Test waiting room features
      await expect(page.locator('[data-testid="camera-test"]')).toBeVisible();
      await expect(page.locator('[data-testid="microphone-test"]')).toBeVisible();
      await expect(page.locator('[data-testid="connection-test"]')).toBeVisible();
    });

    test('should handle session notes access', async ({ page }) => {
      // Navigate to dashboard
      await navigateAndVerify(page, '/user');
      await waitForApiCall(page, '/api/users/dashboard', 'GET');
      
      // Navigate to session history
      await page.locator('[data-testid="session-history"]').click();
      
      // Find completed session
      const completedSession = page.locator('[data-testid="completed-session"]').first();
      
      if (await completedSession.isVisible()) {
        // Click view session details
        await completedSession.locator('[data-testid="view-session"]').click();
        
        // Verify session details page
        await expect(page.locator('[data-testid="session-details"]')).toBeVisible();
        
        // Verify session notes (if available)
        const sessionNotes = page.locator('[data-testid="session-notes"]');
        if (await sessionNotes.isVisible()) {
          await expect(sessionNotes).toContainText('Session notes:');
        }
        
        // Verify session recording (if available)
        const sessionRecording = page.locator('[data-testid="session-recording"]');
        if (await sessionRecording.isVisible()) {
          await expect(sessionRecording).toBeVisible();
        }
        
        // Verify action items
        await expect(page.locator('[data-testid="action-items"]')).toBeVisible();
      }
    });
  });

  test.describe('Therapist Meeting Experience', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'approvedTherapist');
    });

    test('should start a scheduled meeting', async ({ page }) => {
      // Navigate to therapist dashboard
      await navigateAndVerify(page, '/therapist');
      await waitForApiCall(page, '/api/therapist/dashboard', 'GET');
      
      // Find upcoming session
      const upcomingSession = page.locator('[data-testid="upcoming-session"]').first();
      
      if (await upcomingSession.isVisible()) {
        // Click start meeting button
        await upcomingSession.locator('[data-testid="start-meeting"]').click();
        
        // Wait for meeting room to load
        await waitForApiCall(page, '/api/meetings/*/start', 'POST');
        
        // Verify meeting room page
        await verifyCurrentPage(page, /\/meeting\/[^\/]+/);
        
        // Verify therapist meeting interface
        await expect(page.locator('[data-testid="therapist-meeting-room"]')).toBeVisible();
        await expect(page.locator('[data-testid="patient-video"]')).toBeVisible();
        await expect(page.locator('[data-testid="session-tools"]')).toBeVisible();
      }
    });

    test('should use session tools', async ({ page }) => {
      // Navigate to active meeting
      await page.goto('/meeting/test-meeting-id');
      await waitForPageLoad(page);
      
      // Test session notes
      await page.locator('[data-testid="session-notes-toggle"]').click();
      await expect(page.locator('[data-testid="session-notes-panel"]')).toBeVisible();
      
      // Add session notes
      await fillForm(page, {
        sessionNotes: 'Patient discussed anxiety triggers related to work stress.'
      });
      
      // Auto-save notes
      await page.waitForTimeout(2000); // Wait for auto-save
      await expect(page.locator('[data-testid="notes-saved"]')).toBeVisible();
      
      // Test mood tracking
      await page.locator('[data-testid="mood-tracker"]').click();
      await page.locator('[data-testid="mood-anxious"]').click();
      await page.locator('[data-testid="mood-severity-7"]').click();
      
      // Test worksheet sharing
      await page.locator('[data-testid="share-worksheet"]').click();
      await expect(page.locator('[data-testid="worksheet-library"]')).toBeVisible();
      
      // Select and share worksheet
      await page.locator('[data-testid="worksheet-anxiety-management"]').click();
      await page.locator('[data-testid="share-with-client"]').click();
      
      // Verify worksheet shared
      await expect(page.locator('[data-testid="worksheet-shared"]')).toBeVisible();
    });

    test('should manage session recording', async ({ page }) => {
      // Navigate to active meeting
      await page.goto('/meeting/test-meeting-id');
      await waitForPageLoad(page);
      
      // Start recording
      await page.locator('[data-testid="start-recording"]').click();
      
      // Verify recording consent
      await expect(page.locator('[data-testid="recording-consent"]')).toBeVisible();
      await page.locator('[data-testid="confirm-recording"]').click();
      
      // Wait for recording to start
      await waitForApiCall(page, '/api/meetings/*/recording/start', 'POST');
      
      // Verify recording indicator
      await expect(page.locator('[data-testid="recording-active"]')).toBeVisible();
      
      // Stop recording
      await page.locator('[data-testid="stop-recording"]').click();
      
      // Wait for recording to stop
      await waitForApiCall(page, '/api/meetings/*/recording/stop', 'POST');
      
      // Verify recording stopped
      await expect(page.locator('[data-testid="recording-stopped"]')).toBeVisible();
    });

    test('should complete session with notes', async ({ page }) => {
      // Navigate to active meeting
      await page.goto('/meeting/test-meeting-id');
      await waitForPageLoad(page);
      
      // End meeting
      await page.locator('[data-testid="end-session"]').click();
      
      // Verify session completion form
      await expect(page.locator('[data-testid="session-completion-form"]')).toBeVisible();
      
      // Fill session completion details
      await fillForm(page, {
        sessionSummary: 'Productive session focusing on anxiety management techniques.',
        patientProgress: 'Patient showing improvement in recognizing triggers.',
        nextSessionGoals: 'Continue practicing breathing exercises, discuss coping strategies.',
        homeworkAssigned: 'Daily breathing exercises, anxiety journal.',
        sessionRating: '4',
        privateNotes: 'Patient seemed more comfortable today.'
      });
      
      // Set next appointment
      await page.locator('[data-testid="schedule-next"]').click();
      await page.locator('[data-testid="next-week-same-time"]').click();
      
      // Complete session
      await submitForm(page);
      
      // Wait for session completion
      await waitForApiCall(page, '/api/sessions/*/complete', 'POST');
      
      // Verify session completed
      await verifyFormSuccess(page, 'Session completed successfully');
      
      // Verify redirect to dashboard
      await verifyCurrentPage(page, '/therapist');
    });

    test('should handle emergency situations', async ({ page }) => {
      // Navigate to active meeting
      await page.goto('/meeting/test-meeting-id');
      await waitForPageLoad(page);
      
      // Trigger emergency protocol
      await page.locator('[data-testid="emergency-button"]').click();
      
      // Verify emergency modal
      await expect(page.locator('[data-testid="emergency-modal"]')).toBeVisible();
      
      // Select emergency type
      await page.locator('[data-testid="emergency-suicide-risk"]').click();
      
      // Fill emergency details
      await fillForm(page, {
        emergencyNotes: 'Patient expressed suicidal ideation. Immediate intervention required.',
        immediateActions: 'Contacted crisis hotline, recommended emergency services.'
      });
      
      // Submit emergency report
      await page.locator('[data-testid="submit-emergency"]').click();
      
      // Wait for emergency API call
      await waitForApiCall(page, '/api/sessions/*/emergency', 'POST');
      
      // Verify emergency resources displayed
      await expect(page.locator('[data-testid="crisis-resources"]')).toBeVisible();
      await expect(page.locator('[data-testid="emergency-contacts"]')).toBeVisible();
    });

    test('should access patient history during session', async ({ page }) => {
      // Navigate to active meeting
      await page.goto('/meeting/test-meeting-id');
      await waitForPageLoad(page);
      
      // Open patient history panel
      await page.locator('[data-testid="patient-history"]').click();
      
      // Verify patient history panel
      await expect(page.locator('[data-testid="patient-history-panel"]')).toBeVisible();
      
      // Verify previous sessions
      await expect(page.locator('[data-testid="previous-sessions"]')).toBeVisible();
      
      // Verify patient goals
      await expect(page.locator('[data-testid="patient-goals"]')).toBeVisible();
      
      // Verify medication information
      await expect(page.locator('[data-testid="medication-info"]')).toBeVisible();
      
      // Verify assessment results
      await expect(page.locator('[data-testid="assessment-results"]')).toBeVisible();
      
      // View specific session notes
      await page.locator('[data-testid="previous-session"]').first().click();
      await expect(page.locator('[data-testid="session-detail"]')).toBeVisible();
    });
  });

  test.describe('Meeting Technical Features', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, 'completeClient');
    });

    test('should handle device switching', async ({ page }) => {
      // Navigate to meeting
      await page.goto('/meeting/test-meeting-id');
      await waitForPageLoad(page);
      
      // Open device settings
      await page.locator('[data-testid="device-settings"]').click();
      
      // Verify device selection panel
      await expect(page.locator('[data-testid="device-selection"]')).toBeVisible();
      
      // Test camera switching
      await page.locator('[data-testid="camera-dropdown"]').click();
      await page.locator('[data-testid="camera-option"]').first().click();
      
      // Test microphone switching
      await page.locator('[data-testid="microphone-dropdown"]').click();
      await page.locator('[data-testid="microphone-option"]').first().click();
      
      // Test speaker switching
      await page.locator('[data-testid="speaker-dropdown"]').click();
      await page.locator('[data-testid="speaker-option"]').first().click();
      
      // Apply device changes
      await page.locator('[data-testid="apply-device-changes"]').click();
      
      // Verify device changes applied
      await expect(page.locator('[data-testid="device-updated"]')).toBeVisible();
    });

    test('should handle network quality monitoring', async ({ page }) => {
      // Navigate to meeting
      await page.goto('/meeting/test-meeting-id');
      await waitForPageLoad(page);
      
      // Verify network quality indicator
      await expect(page.locator('[data-testid="network-quality"]')).toBeVisible();
      
      // Mock poor network conditions
      await page.route('**/api/meetings/*/quality', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ 
            quality: 'poor',
            latency: 500,
            packetLoss: 0.15
          })
        });
      });
      
      // Verify network quality warning
      await expect(page.locator('[data-testid="network-warning"]')).toBeVisible();
      
      // Verify quality adjustment suggestions
      await expect(page.locator('[data-testid="quality-suggestions"]')).toBeVisible();
    });

    test('should handle accessibility features', async ({ page }) => {
      // Navigate to meeting
      await page.goto('/meeting/test-meeting-id');
      await waitForPageLoad(page);
      
      // Enable closed captions
      await page.locator('[data-testid="captions-toggle"]').click();
      
      // Verify captions panel
      await expect(page.locator('[data-testid="captions-panel"]')).toBeVisible();
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="camera-toggle"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="microphone-toggle"]')).toBeFocused();
      
      // Test screen reader support
      await page.locator('[data-testid="camera-toggle"]').click();
      await expect(page.locator('[aria-label="Camera is off"]')).toBeVisible();
      
      // Test high contrast mode
      await page.locator('[data-testid="accessibility-menu"]').click();
      await page.locator('[data-testid="high-contrast"]').click();
      
      // Verify high contrast applied
      await expect(page.locator('[data-testid="meeting-room"]')).toHaveClass(/high-contrast/);
    });
  });
});