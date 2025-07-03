const { chromium } = require('playwright');

async function testTherapistApplicationSubmission() {
  console.log('🚀 Starting comprehensive therapist application test...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the therapist application page
    console.log('📄 Navigating to therapist application page...');
    await page.goto('http://localhost:3000/therapist-application');
    await page.waitForSelector('[data-testid="main-content"]', { timeout: 10000 });
    
    console.log('✅ Page loaded successfully');
    
    // Check initial progress
    const initialProgress = await page.textContent('[data-testid="overall-progress"] .text-sm');
    console.log(`📊 Initial progress: ${initialProgress}`);
    
    // Fill Basic Information Section
    console.log('📝 Filling Basic Information section...');
    
    // Click to open the basic info section if not already open
    await page.click('text=Basic Information');
    await page.waitForTimeout(500);
    
    await page.fill('input[name="firstName"]', 'Dr. John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="mobile"]', '09123456789');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    
    // Select province
    await page.click('[name="province"] + [role="combobox"]');
    await page.waitForTimeout(500);
    await page.click('text=Metro Manila');
    
    // Select provider type
    await page.click('[name="providerType"] + [role="combobox"]');
    await page.waitForTimeout(500);
    await page.click('text=Psychologist');
    
    console.log('✅ Basic Information filled');
    
    // Fill Professional Profile Section
    console.log('📝 Filling Professional Profile section...');
    
    await page.click('text=Professional Profile');
    await page.waitForTimeout(500);
    
    // Professional license type
    await page.click('#rpsy');
    
    // PRC Licensed
    await page.click('#prc-yes');
    await page.waitForTimeout(500);
    
    // Fill PRC details
    await page.fill('input[name="prcLicenseNumber"]', '1234567');
    await page.fill('input[name="expirationDateOfLicense"]', '2025-12-31');
    await page.click('#active-yes');
    
    // Practice start date
    await page.fill('input[name="practiceStartDate"]', '2020-01-01');
    
    // Teletherapy readiness
    await page.click('#online-therapy-yes');
    await page.click('#video-conferencing-yes');
    await page.click('#private-space-yes');
    await page.click('#privacy-act-yes');
    
    // Areas of expertise - select at least one
    await page.click('text=Anxiety >> xpath=ancestor::label >> input[type="checkbox"]');
    await page.click('text=Depression >> xpath=ancestor::label >> input[type="checkbox"]');
    
    // Assessment tools - select at least one
    await page.click('text=Generalized Anxiety Disorder-7 (GAD-7) >> xpath=ancestor::label >> input[type="checkbox"]');
    await page.click('text=Patient Health Questionnaire-9 (PHQ-9) >> xpath=ancestor::label >> input[type="checkbox"]');
    
    // Therapeutic approaches - select at least one
    await page.click('text=CBT (Cognitive Behavioral Therapy) >> xpath=ancestor::label >> input[type="checkbox"]');
    
    // Languages offered - select at least one
    await page.click('text=English >> xpath=ancestor::label >> input[type="checkbox"]');
    
    // Compliance
    await page.click('#liability-yes');
    await page.click('#complaints-no');
    await page.click('#guidelines-yes');
    
    console.log('✅ Professional Profile filled');
    
    // Fill Availability & Services Section
    console.log('📝 Filling Availability & Services section...');
    
    await page.click('text=Availability & Services');
    await page.waitForTimeout(500);
    
    // Weekly availability
    await page.click('#weekly-11-20');
    
    // Session length
    await page.click('#session-60');
    
    // Payment methods
    await page.click('text=Self-pay >> xpath=ancestor::label >> input[type="checkbox"]');
    
    // Optional: hourly rate
    await page.fill('input[name="hourlyRate"]', '1500');
    
    // Optional: bio
    await page.fill('textarea[name="bio"]', 'Experienced psychologist specializing in anxiety and depression treatment.');
    
    console.log('✅ Availability & Services filled');
    
    // Document Upload Section (skip for now as it requires actual files)
    console.log('📝 Skipping Document Upload section for this test...');
    
    // Review & Submit Section
    console.log('📝 Filling Review & Submit section...');
    
    await page.click('text=Review & Submit');
    await page.waitForTimeout(500);
    
    // Check consent
    await page.click('input[name="consentChecked"]');
    
    console.log('✅ Review & Submit completed');
    
    // Check final progress
    await page.waitForTimeout(1000);
    const finalProgress = await page.textContent('[data-testid="overall-progress"] .text-sm');
    console.log(`📊 Final progress: ${finalProgress}`);
    
    // Check if submit button is enabled
    const submitButton = page.locator('button[type="submit"]');
    const isEnabled = await submitButton.isEnabled();
    console.log(`🔘 Submit button enabled: ${isEnabled}`);
    
    if (isEnabled) {
      console.log('🎉 Form validation passed! Submit button is enabled.');
      
      // Optional: Actually try to submit (commented out to avoid hitting backend)
      // console.log('🚀 Attempting form submission...');
      // await submitButton.click();
      // await page.waitForTimeout(3000);
      
    } else {
      console.log('❌ Form validation failed. Submit button is still disabled.');
      
      // Check for validation errors
      const errorMessages = await page.locator('.text-red-500, .text-destructive').allTextContents();
      if (errorMessages.length > 0) {
        console.log('🚨 Validation errors found:');
        errorMessages.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
    }
    
    // Take a screenshot for verification
    await page.screenshot({ path: '/tmp/therapist-application-test.png', fullPage: true });
    console.log('📸 Screenshot saved to /tmp/therapist-application-test.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: '/tmp/therapist-application-error.png', fullPage: true });
    console.log('📸 Error screenshot saved to /tmp/therapist-application-error.png');
  } finally {
    await browser.close();
    console.log('🏁 Test completed');
  }
}

// Run the test
testTherapistApplicationSubmission().catch(console.error);