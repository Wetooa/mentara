import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { navigateAndVerify, verifyCurrentPage, waitForPageLoad } from '../helpers/navigation';
import { fillForm, submitForm, verifyFormSuccess, navigateFormStep } from '../helpers/forms';
import { waitForApiCall, verifyLoadingState } from '../helpers/api';

test.describe('Complete User Journey', () => {
  test.describe('End-to-End User Flow', () => {
    test('should complete full user journey from signup to session completion', async ({ page }) => {
      // === REGISTRATION ===
      await page.goto('/sign-up');
      
      // Register new user
      await fillForm(page, {
        firstName: 'Emma',
        lastName: 'Wilson',
        email: 'emma.wilson.e2e@test.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        termsAccepted: 'true'
      });
      
      await submitForm(page);
      await waitForApiCall(page, '/api/auth/register', 'POST');
      
      // Mock email verification
      await page.goto('/verify?token=mock-verification-token');
      await waitForApiCall(page, '/api/auth/verify', 'POST');
      
      // === LOGIN ===
      await page.goto('/sign-in');
      await fillForm(page, {
        identifier: 'emma.wilson.e2e@test.com',
        password: 'SecurePassword123!'
      });
      
      await submitForm(page);
      await waitForApiCall(page, '/api/auth/login', 'POST');
      
      // === ONBOARDING ===
      await verifyCurrentPage(page, '/user/onboarding');
      
      // Step 1: Profile Information
      await fillForm(page, {
        firstName: 'Emma',
        lastName: 'Wilson',
        dateOfBirth: '1990-05-15',
        gender: 'female',
        phoneNumber: '+1234567890',
        province: 'Ontario',
        emergencyContact: 'John Wilson',
        emergencyPhone: '+1234567891'
      });
      
      await navigateFormStep(page, 'next');
      await waitForApiCall(page, '/api/users/profile', 'PUT');
      
      // Step 2: Goals Setting
      await page.locator('[data-testid="goal-anxiety"]').click();
      await page.locator('[data-testid="goal-stress"]').click();
      await page.locator('[data-testid="priority-high"]').click();
      
      await fillForm(page, {
        currentChallenges: 'Work-related stress and social anxiety',
        previousTherapy: 'no',
        medications: 'None',
        additionalNotes: 'Looking for practical coping strategies'
      });
      
      await navigateFormStep(page, 'next');
      await waitForApiCall(page, '/api/users/goals', 'PUT');
      
      // Step 3: Therapist Preferences
      await page.locator('[data-testid="gender-preference-no-preference"]').click();
      await page.locator('[data-testid="approach-cbt"]').click();
      
      await fillForm(page, {
        sessionFrequency: 'weekly',
        sessionDuration: '60',
        preferredTimes: 'evening',
        communicationStyle: 'supportive'
      });
      
      await navigateFormStep(page, 'next');
      await waitForApiCall(page, '/api/users/therapist-preferences', 'PUT');
      
      // Step 4: Complete Onboarding
      await submitForm(page);
      await waitForApiCall(page, '/api/users/onboarding/complete', 'POST');
      
      // === THERAPIST SELECTION ===
      await verifyCurrentPage(page, '/user/onboarding/complete');
      await page.locator('[data-testid="continue-to-dashboard"]').click();
      
      await verifyCurrentPage(page, '/user');
      
      // Navigate to therapist recommendations
      await page.locator('[data-testid="find-therapist"]').click();
      await navigateAndVerify(page, '/user/therapist');
      await waitForApiCall(page, '/api/therapists/recommendations', 'GET');
      
      // View therapist profile
      const firstTherapist = page.locator('[data-testid="therapist-card"]').first();
      await firstTherapist.locator('[data-testid="view-profile-btn"]').click();
      
      await expect(page.locator('[data-testid="therapist-profile-modal"]')).toBeVisible();
      await waitForApiCall(page, '/api/therapists/*/profile', 'GET');
      
      // === BOOKING FIRST SESSION ===
      await page.locator('[data-testid="book-session-modal-btn"]').click();
      await expect(page.locator('[data-testid="booking-modal"]')).toBeVisible();
      
      await waitForApiCall(page, '/api/booking/available-slots', 'GET');
      
      // Select appointment time
      await page.locator('[data-testid="date-slot"]').first().click();
      await page.locator('[data-testid="time-slot"]').first().click();
      
      // Fill session details
      await fillForm(page, {
        sessionType: 'individual',
        sessionGoal: 'Initial consultation to discuss anxiety and stress management',
        additionalNotes: 'First-time therapy client, feeling nervous but motivated'
      });
      
      await submitForm(page);
      await waitForApiCall(page, '/api/booking/sessions', 'POST');
      
      // === PAYMENT PROCESSING ===
      await expect(page.locator('[data-testid="payment-form"]')).toBeVisible();
      
      await fillForm(page, {
        cardNumber: '4242424242424242',
        expiryDate: '12/25',
        cvv: '123',
        cardholderName: 'Emma Wilson'
      });
      
      await page.locator('[data-testid="process-payment"]').click();
      await waitForApiCall(page, '/api/booking/payment', 'POST');
      
      // === BOOKING CONFIRMATION ===
      await verifyCurrentPage(page, '/user/booking/confirmation');
      await expect(page.locator('[data-testid="booking-confirmed"]')).toBeVisible();
      
      // Add to calendar
      await page.locator('[data-testid="add-to-calendar"]').click();
      
      // === PRE-SESSION PREPARATION ===
      await page.locator('[data-testid="return-to-dashboard"]').click();
      await verifyCurrentPage(page, '/user');
      
      // Check upcoming sessions
      await expect(page.locator('[data-testid="upcoming-sessions"]')).toBeVisible();
      
      // Navigate to pre-assessment
      await page.locator('[data-testid="complete-pre-assessment"]').click();
      await navigateAndVerify(page, '/user/pre-assessment');
      
      // Complete pre-assessment questionnaire
      await waitForApiCall(page, '/api/pre-assessment/questions', 'GET');
      
      // PHQ-9 Depression Scale
      await page.locator('[data-testid="phq9-1"]').click(); // Little interest
      await page.locator('[data-testid="phq9-2"]').click(); // Feeling down
      await page.locator('[data-testid="phq9-3"]').click(); // Sleep problems
      
      // GAD-7 Anxiety Scale
      await page.locator('[data-testid="gad7-1"]').click(); // Feeling nervous
      await page.locator('[data-testid="gad7-2"]').click(); // Unable to control worrying
      
      // Complete additional scales
      await fillForm(page, {
        stressLevel: '7',
        sleepQuality: '4',
        energyLevel: '5',
        additionalConcerns: 'Work deadline pressure, social situations'
      });
      
      await submitForm(page);
      await waitForApiCall(page, '/api/pre-assessment/submit', 'POST');
      
      // === SESSION DAY ===
      // Mock session time approaching
      await page.route('**/api/sessions/upcoming', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            sessions: [{
              id: 'session-001',
              startTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
              therapistName: 'Dr. Sarah Johnson',
              meetingId: 'meeting-001'
            }]
          })
        });
      });
      
      await navigateAndVerify(page, '/user');
      await waitForApiCall(page, '/api/sessions/upcoming', 'GET');
      
      // Join session
      await page.locator('[data-testid="join-session"]').click();
      await waitForApiCall(page, '/api/meetings/*/join', 'POST');
      
      // === IN-SESSION EXPERIENCE ===
      await verifyCurrentPage(page, /\/meeting\/[^\/]+/);
      
      // Pre-meeting setup
      await expect(page.locator('[data-testid="pre-meeting-setup"]')).toBeVisible();
      
      // Test camera and microphone
      await page.locator('[data-testid="test-camera"]').click();
      await page.locator('[data-testid="test-microphone"]').click();
      
      // Join meeting
      await page.locator('[data-testid="join-meeting-button"]').click();
      await waitForApiCall(page, '/api/meetings/*/start', 'POST');
      
      // Verify meeting interface
      await expect(page.locator('[data-testid="meeting-active"]')).toBeVisible();
      await expect(page.locator('[data-testid="therapist-video"]')).toBeVisible();
      
      // Use chat feature
      await page.locator('[data-testid="chat-toggle"]').click();
      await fillForm(page, {
        chatMessage: 'Thank you for this session, it\'s very helpful!'
      });
      
      await page.locator('[data-testid="send-message"]').click();
      
      // === POST-SESSION ===
      // Mock session ending
      await page.route('**/api/meetings/*/status', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ status: 'ended' })
        });
      });
      
      await page.reload();
      await waitForPageLoad(page);
      
      // Verify post-session interface
      await expect(page.locator('[data-testid="session-ended"]')).toBeVisible();
      
      // Rate the session
      await page.locator('[data-testid="rating-5"]').click();
      await fillForm(page, {
        sessionFeedback: 'Excellent first session! Dr. Johnson was very understanding and provided practical strategies.',
        wouldRecommend: 'yes'
      });
      
      await page.locator('[data-testid="submit-rating"]').click();
      await waitForApiCall(page, '/api/sessions/*/rating', 'POST');
      
      // === FOLLOW-UP ACTIONS ===
      // Book next session
      await page.locator('[data-testid="book-next-session"]').click();
      await expect(page.locator('[data-testid="booking-modal"]')).toBeVisible();
      
      // Schedule recurring sessions
      await page.locator('[data-testid="recurring-toggle"]').click();
      await page.locator('[data-testid="recurring-weekly"]').click();
      await page.locator('[data-testid="recurring-8-weeks"]').click();
      
      await page.locator('[data-testid="same-time-slot"]').click();
      await submitForm(page);
      
      await waitForApiCall(page, '/api/booking/sessions/recurring', 'POST');
      
      // === HOMEWORK AND WORKSHEETS ===
      await navigateAndVerify(page, '/user/worksheets');
      await waitForApiCall(page, '/api/worksheets/assigned', 'GET');
      
      // Complete assigned worksheet
      const worksheet = page.locator('[data-testid="worksheet-item"]').first();
      await worksheet.click();
      
      await waitForApiCall(page, '/api/worksheets/*/content', 'GET');
      
      // Fill worksheet
      await fillForm(page, {
        anxietyTrigger1: 'Work presentations',
        copingStrategy1: 'Deep breathing exercises',
        anxietyTrigger2: 'Social gatherings',
        copingStrategy2: 'Positive self-talk',
        weeklyGoal: 'Practice breathing exercises daily'
      });
      
      await submitForm(page);
      await waitForApiCall(page, '/api/worksheets/*/submit', 'POST');
      
      // === PROGRESS TRACKING ===
      await navigateAndVerify(page, '/user');
      
      // Check progress dashboard
      await expect(page.locator('[data-testid="progress-overview"]')).toBeVisible();
      await expect(page.locator('[data-testid="sessions-completed"]')).toContainText('1');
      await expect(page.locator('[data-testid="worksheets-completed"]')).toContainText('1');
      
      // View detailed progress
      await page.locator('[data-testid="view-progress"]').click();
      
      await expect(page.locator('[data-testid="mood-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="goal-progress"]')).toBeVisible();
      
      // === COMMUNITY ENGAGEMENT ===
      await navigateAndVerify(page, '/user/community');
      await waitForApiCall(page, '/api/communities/user', 'GET');
      
      // Join anxiety support group
      await page.locator('[data-testid="join-anxiety-group"]').click();
      await waitForApiCall(page, '/api/communities/*/join', 'POST');
      
      // Make first post
      await page.locator('[data-testid="create-post"]').click();
      await fillForm(page, {
        postContent: 'Just completed my first therapy session! Feeling hopeful about the journey ahead.',
        postType: 'encouragement'
      });
      
      await submitForm(page);
      await waitForApiCall(page, '/api/posts/create', 'POST');
      
      // === FINAL VERIFICATION ===
      await navigateAndVerify(page, '/user');
      
      // Verify user dashboard shows completed journey
      await expect(page.locator('[data-testid="welcome-back"]')).toBeVisible();
      await expect(page.locator('[data-testid="next-session"]')).toBeVisible();
      await expect(page.locator('[data-testid="progress-summary"]')).toBeVisible();
      
      // Verify user profile is complete
      await page.locator('[data-testid="user-menu"]').click();
      await page.locator('[data-testid="profile-settings"]').click();
      
      await expect(page.locator('[data-testid="profile-complete"]')).toBeVisible();
      await expect(page.locator('[data-testid="onboarding-complete"]')).toBeVisible();
      
      // Log successful completion
      console.log('✅ Complete user journey test passed successfully!');
    });
  });

  test.describe('Therapist Journey', () => {
    test('should complete therapist application and first session', async ({ page }) => {
      // === THERAPIST APPLICATION ===
      await page.goto('/therapist-application');
      
      // Basic Information
      await fillForm(page, {
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson.e2e@test.com',
        phone: '+1234567890',
        dateOfBirth: '1980-03-15',
        address: '123 Main Street',
        city: 'Toronto',
        province: 'Ontario',
        postalCode: 'M5H 2N2'
      });
      
      await navigateFormStep(page, 'next');
      
      // Professional Information
      await fillForm(page, {
        licenseNumber: 'ON-12345',
        licenseType: 'Clinical Psychology',
        issueDate: '2010-06-01',
        expiryDate: '2025-06-01',
        education: 'PhD in Clinical Psychology, University of Toronto',
        specializations: 'Anxiety, Depression, Trauma',
        yearsExperience: '10',
        currentPosition: 'Senior Clinical Psychologist'
      });
      
      await navigateFormStep(page, 'next');
      
      // Document Upload
      await page.locator('[data-testid="license-upload"]').setInputFiles('test-license.pdf');
      await page.locator('[data-testid="cv-upload"]').setInputFiles('test-cv.pdf');
      await page.locator('[data-testid="certification-upload"]').setInputFiles('test-cert.pdf');
      
      await navigateFormStep(page, 'next');
      
      // Availability
      await page.locator('[data-testid="monday-9am"]').click();
      await page.locator('[data-testid="monday-10am"]').click();
      await page.locator('[data-testid="tuesday-2pm"]').click();
      
      await fillForm(page, {
        sessionRate: '120',
        acceptsInsurance: 'yes',
        onlineTherapy: 'yes',
        inPersonTherapy: 'no'
      });
      
      await navigateFormStep(page, 'next');
      
      // Submit Application
      await submitForm(page);
      await waitForApiCall(page, '/api/therapist/application', 'POST');
      
      // === APPLICATION APPROVAL (Mock) ===
      await page.route('**/api/therapist/application/status', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ status: 'approved' })
        });
      });
      
      // === THERAPIST ONBOARDING ===
      await page.goto('/therapist/welcome');
      
      // Complete therapist profile
      await fillForm(page, {
        bio: 'Experienced psychologist specializing in anxiety and depression treatment.',
        approach: 'Cognitive Behavioral Therapy with mindfulness integration',
        languages: 'English, French',
        sessionTypes: 'Individual, Group'
      });
      
      await submitForm(page);
      await waitForApiCall(page, '/api/therapist/profile', 'PUT');
      
      // === FIRST PATIENT ASSIGNMENT ===
      await loginAs(page, 'approvedTherapist');
      await navigateAndVerify(page, '/therapist');
      
      // Check new patient assignments
      await waitForApiCall(page, '/api/therapist/patients', 'GET');
      
      // Accept new patient
      await page.locator('[data-testid="new-patient-assignment"]').first().click();
      await page.locator('[data-testid="accept-patient"]').click();
      
      await waitForApiCall(page, '/api/therapist/patients/*/accept', 'POST');
      
      // === FIRST SESSION PREPARATION ===
      // Review patient information
      await page.locator('[data-testid="patient-profile"]').click();
      
      await expect(page.locator('[data-testid="patient-goals"]')).toBeVisible();
      await expect(page.locator('[data-testid="patient-assessment"]')).toBeVisible();
      await expect(page.locator('[data-testid="patient-history"]')).toBeVisible();
      
      // Prepare session plan
      await page.locator('[data-testid="prepare-session"]').click();
      await fillForm(page, {
        sessionGoals: 'Establish rapport, assess current anxiety levels, introduce CBT concepts',
        plannedActivities: 'Breathing exercises, thought challenging worksheet',
        notesToSelf: 'Patient is new to therapy, be supportive and encouraging'
      });
      
      await submitForm(page);
      await waitForApiCall(page, '/api/therapist/sessions/*/prepare', 'POST');
      
      // === CONDUCTING THE SESSION ===
      // Start session
      await page.locator('[data-testid="start-session"]').click();
      await waitForApiCall(page, '/api/meetings/*/start', 'POST');
      
      // Verify therapist meeting interface
      await expect(page.locator('[data-testid="therapist-meeting-room"]')).toBeVisible();
      
      // Use session tools
      await page.locator('[data-testid="session-notes"]').click();
      await fillForm(page, {
        sessionNotes: 'Patient engaged well, demonstrated good insight into anxiety triggers.'
      });
      
      // Share worksheet
      await page.locator('[data-testid="share-worksheet"]').click();
      await page.locator('[data-testid="anxiety-worksheet"]').click();
      
      // === SESSION COMPLETION ===
      await page.locator('[data-testid="end-session"]').click();
      
      // Complete session summary
      await fillForm(page, {
        sessionSummary: 'Successful first session. Patient showed openness to CBT techniques.',
        patientProgress: 'Good initial engagement, identified key anxiety triggers',
        nextSessionGoals: 'Continue CBT techniques, introduce relaxation strategies',
        homework: 'Daily anxiety log, practice breathing exercises',
        sessionRating: '4',
        privateNotes: 'Patient seems motivated, good therapeutic alliance developing'
      });
      
      await submitForm(page);
      await waitForApiCall(page, '/api/sessions/*/complete', 'POST');
      
      // === FOLLOW-UP PLANNING ===
      // Schedule next session
      await page.locator('[data-testid="schedule-next"]').click();
      await page.locator('[data-testid="next-week-same-time"]').click();
      
      // Assign homework
      await page.locator('[data-testid="assign-worksheet"]').click();
      await page.locator('[data-testid="thought-record-worksheet"]').click();
      await page.locator('[data-testid="assign-worksheet-btn"]').click();
      
      await waitForApiCall(page, '/api/worksheets/assign', 'POST');
      
      // === VERIFY COMPLETION ===
      await navigateAndVerify(page, '/therapist');
      
      // Verify session appears in history
      await expect(page.locator('[data-testid="recent-sessions"]')).toContainText('Dr. Sarah Johnson');
      
      // Verify patient progress tracking
      await expect(page.locator('[data-testid="patient-progress"]')).toBeVisible();
      
      console.log('✅ Complete therapist journey test passed successfully!');
    });
  });

  test.describe('Cross-Platform Compatibility', () => {
    test('should work seamlessly across different devices', async ({ page, browser }) => {
      // Test desktop experience
      await page.setViewportSize({ width: 1920, height: 1080 });
      await loginAs(page, 'completeClient');
      
      // Navigate to dashboard
      await navigateAndVerify(page, '/user');
      await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible();
      
      // Test tablet experience
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await waitForPageLoad(page);
      
      await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();
      
      // Test mobile experience
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await waitForPageLoad(page);
      
      await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
      
      // Test mobile navigation
      await page.locator('[data-testid="mobile-menu-toggle"]').click();
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
      
      // Test responsive booking flow
      await page.locator('[data-testid="mobile-find-therapist"]').click();
      await page.locator('[data-testid="mobile-book-session"]').first().click();
      
      await expect(page.locator('[data-testid="mobile-booking-modal"]')).toBeVisible();
      
      console.log('✅ Cross-platform compatibility test passed successfully!');
    });
  });

  test.describe('Performance and Load Testing', () => {
    test('should handle multiple concurrent users', async ({ page, browser }) => {
      // Create multiple browser contexts
      const contexts = await Promise.all([
        browser.newContext(),
        browser.newContext(),
        browser.newContext()
      ]);
      
      const pages = await Promise.all(contexts.map(context => context.newPage()));
      
      // Login different users concurrently
      await Promise.all([
        loginAs(pages[0], 'basicClient'),
        loginAs(pages[1], 'completeClient'),
        loginAs(pages[2], 'approvedTherapist')
      ]);
      
      // Navigate to different pages concurrently
      await Promise.all([
        navigateAndVerify(pages[0], '/user/onboarding'),
        navigateAndVerify(pages[1], '/user/therapist'),
        navigateAndVerify(pages[2], '/therapist/dashboard')
      ]);
      
      // Verify all pages loaded successfully
      await Promise.all([
        expect(pages[0].locator('[data-testid="onboarding-container"]')).toBeVisible(),
        expect(pages[1].locator('[data-testid="therapist-recommendations"]')).toBeVisible(),
        expect(pages[2].locator('[data-testid="therapist-dashboard"]')).toBeVisible()
      ]);
      
      // Cleanup
      await Promise.all(contexts.map(context => context.close()));
      
      console.log('✅ Concurrent user test passed successfully!');
    });
  });
});