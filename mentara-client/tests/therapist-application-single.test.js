/**
 * Comprehensive Puppeteer Test Suite for Therapist Application
 * Tests form filling, validation, progress tracking, and submission flow
 */

const puppeteer = require('puppeteer');

describe('Therapist Application', () => {
  let browser;
  let page;
  const BASE_URL = 'http://localhost:3000';

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      slowMo: 100, // Slow down actions for debugging
      defaultViewport: { width: 1400, height: 900 }
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    await page.goto(`${BASE_URL}/therapist-application`, { 
      waitUntil: 'networkidle2' 
    });
  });

  describe('Page Load and Initial State', () => {
    test('should load the therapist application successfully', async () => {
      await page.waitForSelector('h1');
      const title = await page.$eval('h1', el => el.textContent);
      expect(title).toBe('Therapist Application');
    });

    test('should show correct initial progress (0%)', async () => {
      const overallProgress = await page.$eval(
        '[data-testid="overall-progress"] .text-gray-600', 
        el => el.textContent
      );
      expect(overallProgress).toBe('0%');
    });

    test('should have Basic Information section open by default', async () => {
      const basicInfoSection = await page.$('[data-state="open"]');
      expect(basicInfoSection).toBeTruthy();
    });

    test('should show submit button as disabled initially', async () => {
      const submitButton = await page.$('button[type="submit"]');
      const isDisabled = await page.evaluate(el => el.disabled, submitButton);
      expect(isDisabled).toBe(true);
    });
  });

  describe('Basic Information Section', () => {
    test('should fill basic information fields correctly', async () => {
      // Fill basic information
      await page.fill('input[placeholder="Enter your first name"]', 'John');
      await page.fill('input[placeholder="Enter your last name"]', 'Doe');
      await page.fill('input[placeholder="e.g., 09xxxxxxxxx"]', '09123456789');
      await page.fill('input[placeholder="Enter your email address"]', 'john.doe@example.com');
      
      // Select province
      await page.click('[data-testid="province-select"]');
      await page.click('text=Metro Manila');
      
      // Select provider type
      await page.click('[data-testid="provider-type-select"]');
      await page.click('text=Individual Practitioner');

      // Check progress update
      await page.waitForTimeout(1000); // Wait for progress calculation
      const basicProgress = await page.$eval(
        '[data-testid="basic-info-progress"]',
        el => el.textContent
      );
      expect(basicProgress).toContain('6/6 complete');
    });

    test('should show validation errors for invalid inputs', async () => {
      await page.fill('input[placeholder="e.g., 09xxxxxxxxx"]', '123'); // Invalid phone
      await page.fill('input[placeholder="Enter your email address"]', 'invalid-email'); // Invalid email
      
      // Trigger validation by clicking outside
      await page.click('h1');
      
      // Check for error messages
      const errors = await page.$$('.text-red-600');
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Professional Profile Section', () => {
    beforeEach(async () => {
      // Fill basic info first
      await fillBasicInformation(page);
      
      // Expand Professional Profile section
      await page.click('[data-testid="professional-profile-header"]');
      await page.waitForSelector('[data-testid="professional-profile-content"]');
    });

    test('should expand and show professional license options', async () => {
      const licenseOptions = await page.$$('input[name="professionalLicenseType"]');
      expect(licenseOptions.length).toBe(4); // RPsy, RPm, RGC, Other
    });

    test('should show conditional PRC license fields when PRC licensed', async () => {
      // Select RPsy license type
      await page.click('input[value="rpsy"]');
      
      // Select PRC licensed = Yes
      await page.click('input[value="yes"][name="isPRCLicensed"]');
      
      // Check for conditional fields
      await page.waitForSelector('input[name="prcLicenseNumber"]');
      await page.waitForSelector('input[name="expirationDateOfLicense"]');
      await page.waitForSelector('input[name="isLicenseActive"]');
    });

    test('should handle teletherapy readiness questions', async () => {
      const teletherapyQuestions = await page.$$('[data-testid^="teletherapy-"]');
      expect(teletherapyQuestions.length).toBe(4);
      
      // Answer all teletherapy questions
      for (let i = 0; i < 4; i++) {
        await page.click(`[data-testid="teletherapy-${i}"] input[value="yes"]`);
      }
    });

    test('should allow multiple expertise area selection', async () => {
      // Select expertise areas
      await page.click('text=Stress');
      await page.click('text=Anxiety');
      await page.click('text=Depression');
      
      // Check selection count
      const selectedCount = await page.$eval(
        '[data-testid="expertise-selected-count"]',
        el => el.textContent
      );
      expect(selectedCount).toContain('3 areas');
    });

    test('should require platform guidelines agreement', async () => {
      // Try to proceed without agreeing to guidelines
      await page.click('input[value="no"][name="compliance.willingToAbideByPlatformGuidelines"]');
      
      // Check that form validation prevents submission
      const submitButton = await page.$('button[type="submit"]');
      const isDisabled = await page.evaluate(el => el.disabled, submitButton);
      expect(isDisabled).toBe(true);
    });
  });

  describe('Document Upload Section', () => {
    beforeEach(async () => {
      await fillBasicInformation(page);
      await fillProfessionalProfile(page);
      
      // Expand Document Upload section
      await page.click('[data-testid="document-upload-header"]');
      await page.waitForSelector('[data-testid="document-upload-content"]');
    });

    test('should show required document upload areas', async () => {
      const requiredDocs = await page.$$('[data-testid^="doc-upload-required-"]');
      expect(requiredDocs.length).toBe(3); // PRC License, NBI, Resume
    });

    test('should show optional document upload areas', async () => {
      const optionalDocs = await page.$$('[data-testid^="doc-upload-optional-"]');
      expect(optionalDocs.length).toBe(2); // Insurance, BIR Form
    });

    test('should handle file upload simulation', async () => {
      // Note: Actual file upload testing would require test files
      // This tests the UI interaction
      const uploadButton = await page.$('[data-testid="prc-license-upload"]');
      expect(uploadButton).toBeTruthy();
    });
  });

  describe('Review & Submit Section', () => {
    beforeEach(async () => {
      await fillCompleteApplication(page);
      
      // Expand Review section
      await page.click('[data-testid="review-submit-header"]');
      await page.waitForSelector('[data-testid="review-submit-content"]');
    });

    test('should show application summary', async () => {
      const summary = await page.$('[data-testid="application-summary"]');
      expect(summary).toBeTruthy();
      
      const name = await page.$eval('[data-testid="summary-name"]', el => el.textContent);
      expect(name).toContain('John Doe');
    });

    test('should require consent checkbox', async () => {
      // Uncheck consent
      await page.click('input[name="consentChecked"]');
      
      const submitButton = await page.$('button[type="submit"]');
      const isDisabled = await page.evaluate(el => el.disabled, submitButton);
      expect(isDisabled).toBe(true);
    });

    test('should enable submit when all requirements met', async () => {
      // Check consent
      await page.click('input[name="consentChecked"]');
      
      await page.waitForTimeout(1000); // Wait for validation
      
      const submitButton = await page.$('button[type="submit"]');
      const isDisabled = await page.evaluate(el => el.disabled, submitButton);
      expect(isDisabled).toBe(false);
    });
  });

  describe('Progress Tracking', () => {
    test('should update overall progress as sections are completed', async () => {
      // Initial state
      let progress = await getOverallProgress(page);
      expect(progress).toBe(0);
      
      // Complete basic info
      await fillBasicInformation(page);
      progress = await getOverallProgress(page);
      expect(progress).toBeGreaterThan(0);
      
      // Complete professional profile
      await fillProfessionalProfile(page);
      progress = await getOverallProgress(page);
      expect(progress).toBeGreaterThan(30);
      
      // Complete documents (simulated)
      await simulateDocumentUpload(page);
      progress = await getOverallProgress(page);
      expect(progress).toBeGreaterThan(70);
      
      // Complete review
      await fillReviewSection(page);
      progress = await getOverallProgress(page);
      expect(progress).toBe(100);
    });

    test('should show section-level progress indicators', async () => {
      await fillBasicInformation(page);
      
      const basicProgress = await page.$eval(
        '[data-testid="basic-info-completion"]',
        el => el.textContent
      );
      expect(basicProgress).toContain('100%');
    });
  });

  describe('Auto-save Functionality', () => {
    test('should show auto-save status after form changes', async () => {
      await page.fill('input[placeholder="Enter your first name"]', 'John');
      
      // Wait for auto-save (30 seconds in real app, we'll mock this)
      await page.waitForTimeout(2000);
      
      const saveStatus = await page.$eval(
        '[data-testid="auto-save-status"]',
        el => el.textContent
      );
      expect(saveStatus).toContain('Saved');
    });
  });

  describe('Toast Notifications', () => {
    test('should show toast on auto-save', async () => {
      await page.fill('input[placeholder="Enter your first name"]', 'John');
      
      // Trigger auto-save manually for testing
      await page.evaluate(() => {
        window.dispatchEvent(new Event('autosave'));
      });
      
      await page.waitForSelector('.toast', { timeout: 5000 });
      const toastText = await page.$eval('.toast', el => el.textContent);
      expect(toastText).toContain('saved');
    });
  });

  describe('Form Submission', () => {
    test('should handle successful form submission', async () => {
      await fillCompleteApplication(page);
      
      // Mock successful submission
      await page.evaluate(() => {
        window.__TEST_MODE__ = true;
      });
      
      await page.click('button[type="submit"]');
      
      // Check for loading state
      const loadingButton = await page.waitForSelector('button:has-text("Submitting")');
      expect(loadingButton).toBeTruthy();
      
      // Check for success redirect (mocked)
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      expect(currentUrl).toContain('success');
    });

    test('should handle form submission errors gracefully', async () => {
      await fillCompleteApplication(page);
      
      // Mock submission error
      await page.evaluate(() => {
        window.__TEST_ERROR__ = true;
      });
      
      await page.click('button[type="submit"]');
      
      // Check for error toast
      await page.waitForSelector('.toast-error', { timeout: 5000 });
      const errorToast = await page.$eval('.toast-error', el => el.textContent);
      expect(errorToast).toContain('error');
    });
  });

  describe('Responsive Design', () => {
    test('should work on mobile viewport', async () => {
      await page.setViewport({ width: 375, height: 667 });
      await page.reload({ waitUntil: 'networkidle2' });
      
      // Check that form is still usable
      const form = await page.$('form');
      expect(form).toBeTruthy();
      
      // Check that sidebar adapts
      const sidebar = await page.$('[data-testid="sidebar"]');
      const sidebarWidth = await page.evaluate(el => 
        window.getComputedStyle(el).width, sidebar
      );
      expect(parseInt(sidebarWidth)).toBeLessThan(300);
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', async () => {
      const ariaLabels = await page.$$('[aria-label]');
      expect(ariaLabels.length).toBeGreaterThan(0);
    });

    test('should support keyboard navigation', async () => {
      // Focus first input
      await page.focus('input[placeholder="Enter your first name"]');
      
      // Tab through form
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.evaluate(() => 
        document.activeElement.placeholder
      );
      expect(focusedElement).toBe('e.g., 09xxxxxxxxx');
    });
  });
});

// Helper Functions
async function fillBasicInformation(page) {
  await page.fill('input[placeholder="Enter your first name"]', 'John');
  await page.fill('input[placeholder="Enter your last name"]', 'Doe');
  await page.fill('input[placeholder="e.g., 09xxxxxxxxx"]', '09123456789');
  await page.fill('input[placeholder="Enter your email address"]', 'john.doe@example.com');
  
  // Select dropdowns (simplified - actual implementation would need proper selectors)
  await page.selectOption('select[name="province"]', 'Metro Manila');
  await page.selectOption('select[name="providerType"]', 'Individual Practitioner');
}

async function fillProfessionalProfile(page) {
  // Expand section
  await page.click('[data-testid="professional-profile-header"]');
  
  // Select license type
  await page.click('input[value="rpsy"]');
  
  // PRC licensed
  await page.click('input[value="yes"][name="isPRCLicensed"]');
  await page.fill('input[name="prcLicenseNumber"]', '1234567');
  await page.fill('input[name="expirationDateOfLicense"]', '2025-12-31');
  await page.click('input[value="yes"][name="isLicenseActive"]');
  
  // Teletherapy readiness
  await page.click('input[value="yes"][name="teletherapyReadiness.providedOnlineTherapyBefore"]');
  await page.click('input[value="yes"][name="teletherapyReadiness.comfortableUsingVideoConferencing"]');
  await page.click('input[value="yes"][name="teletherapyReadiness.privateConfidentialSpace"]');
  await page.click('input[value="yes"][name="teletherapyReadiness.compliesWithDataPrivacyAct"]');
  
  // Expertise areas
  await page.click('text=Stress');
  await page.click('text=Anxiety');
  
  // Compliance
  await page.click('input[value="yes"][name="compliance.professionalLiabilityInsurance"]');
  await page.click('input[value="no"][name="compliance.complaintsOrDisciplinaryActions"]');
  await page.click('input[value="yes"][name="compliance.willingToAbideByPlatformGuidelines"]');
}

async function fillReviewSection(page) {
  await page.click('[data-testid="review-submit-header"]');
  await page.click('input[name="consentChecked"]');
}

async function fillCompleteApplication(page) {
  await fillBasicInformation(page);
  await fillProfessionalProfile(page);
  await simulateDocumentUpload(page);
  await fillReviewSection(page);
}

async function simulateDocumentUpload(page) {
  // In a real test, you would upload actual files
  // For now, we'll just mark documents as uploaded programmatically
  await page.evaluate(() => {
    window.__TEST_DOCUMENTS_UPLOADED__ = true;
  });
}

async function getOverallProgress(page) {
  const progressText = await page.$eval(
    '[data-testid="overall-progress"] .text-gray-600',
    el => el.textContent
  );
  return parseInt(progressText.replace('%', ''));
}

module.exports = {
  fillBasicInformation,
  fillProfessionalProfile,
  fillCompleteApplication,
  getOverallProgress
};