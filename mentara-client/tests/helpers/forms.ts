import { Page, expect } from '@playwright/test';

/**
 * Helper for form interactions and validation
 */
export async function fillForm(page: Page, formData: Record<string, string>, formSelector?: string) {
  const form = formSelector ? page.locator(formSelector) : page.locator('form');
  
  for (const [field, value] of Object.entries(formData)) {
    const input = form.locator(`[name="${field}"], [data-testid="${field}"]`);
    await expect(input).toBeVisible();
    await input.fill(value);
  }
}

/**
 * Helper for selecting from dropdown/select
 */
export async function selectFromDropdown(page: Page, selector: string, value: string) {
  const dropdown = page.locator(selector);
  await dropdown.click();
  await page.locator(`[data-value="${value}"], option[value="${value}"]`).click();
}

/**
 * Helper for checkbox interactions
 */
export async function toggleCheckbox(page: Page, selector: string, checked: boolean = true) {
  const checkbox = page.locator(selector);
  const isChecked = await checkbox.isChecked();
  
  if (isChecked !== checked) {
    await checkbox.click();
  }
}

/**
 * Helper for radio button selection
 */
export async function selectRadioButton(page: Page, name: string, value: string) {
  const radio = page.locator(`[name="${name}"][value="${value}"]`);
  await radio.click();
}

/**
 * Helper for form submission
 */
export async function submitForm(page: Page, formSelector?: string) {
  const form = formSelector ? page.locator(formSelector) : page.locator('form');
  const submitButton = form.locator('[type="submit"], button:has-text("Submit")');
  
  await expect(submitButton).toBeVisible();
  await expect(submitButton).toBeEnabled();
  await submitButton.click();
}

/**
 * Helper for form validation checking
 */
export async function verifyFormErrors(page: Page, expectedErrors: string[]) {
  for (const error of expectedErrors) {
    await expect(page.locator(`text="${error}"`)).toBeVisible();
  }
}

/**
 * Helper for clearing form fields
 */
export async function clearForm(page: Page, fields: string[], formSelector?: string) {
  const form = formSelector ? page.locator(formSelector) : page.locator('form');
  
  for (const field of fields) {
    const input = form.locator(`[name="${field}"], [data-testid="${field}"]`);
    await input.clear();
  }
}

/**
 * Helper for verifying form success
 */
export async function verifyFormSuccess(page: Page, successMessage?: string) {
  const defaultMessage = 'Success';
  const message = successMessage || defaultMessage;
  
  await expect(page.locator(`text="${message}", [data-testid="success-message"]`)).toBeVisible();
}

/**
 * Helper for multi-step form navigation
 */
export async function navigateFormStep(page: Page, direction: 'next' | 'previous') {
  const buttonText = direction === 'next' ? 'Next' : 'Previous';
  const button = page.locator(`button:has-text("${buttonText}"), [data-testid="${direction}-step"]`);
  
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
  await button.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Helper for verifying current form step
 */
export async function verifyFormStep(page: Page, stepNumber: number, totalSteps?: number) {
  const stepIndicator = page.locator(`[data-testid="step-${stepNumber}"], .step-${stepNumber}`);
  await expect(stepIndicator).toBeVisible();
  
  if (totalSteps) {
    const progressText = `${stepNumber} of ${totalSteps}`;
    await expect(page.locator(`text="${progressText}"`)).toBeVisible();
  }
}

/**
 * Helper for file upload
 */
export async function uploadFile(page: Page, fileSelector: string, filePath: string) {
  const fileInput = page.locator(fileSelector);
  await fileInput.setInputFiles(filePath);
}

/**
 * Helper for verifying file upload success
 */
export async function verifyFileUpload(page: Page, fileName: string) {
  await expect(page.locator(`text="${fileName}"`)).toBeVisible();
}

/**
 * Helper for dynamic form interactions
 */
export async function addFormSection(page: Page, addButtonSelector: string) {
  const addButton = page.locator(addButtonSelector);
  await expect(addButton).toBeVisible();
  await addButton.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Helper for removing form sections
 */
export async function removeFormSection(page: Page, removeButtonSelector: string) {
  const removeButton = page.locator(removeButtonSelector);
  await expect(removeButton).toBeVisible();
  await removeButton.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Helper for verifying form field states
 */
export async function verifyFieldState(page: Page, fieldSelector: string, state: 'enabled' | 'disabled' | 'required') {
  const field = page.locator(fieldSelector);
  
  switch (state) {
    case 'enabled':
      await expect(field).toBeEnabled();
      break;
    case 'disabled':
      await expect(field).toBeDisabled();
      break;
    case 'required':
      await expect(field).toHaveAttribute('required');
      break;
  }
}

/**
 * Helper for auto-save verification
 */
export async function verifyAutoSave(page: Page, indicatorSelector: string = '[data-testid="auto-save-indicator"]') {
  // Wait for auto-save indicator to appear
  await expect(page.locator(indicatorSelector)).toBeVisible();
  
  // Wait for auto-save to complete
  await expect(page.locator(indicatorSelector)).toBeHidden({ timeout: 5000 });
}

/**
 * Helper for form validation on blur
 */
export async function triggerFieldValidation(page: Page, fieldSelector: string) {
  const field = page.locator(fieldSelector);
  await field.focus();
  await field.blur();
  await page.waitForTimeout(300); // Allow time for validation
}

/**
 * Helper for conditional form logic
 */
export async function verifyConditionalField(page: Page, triggerSelector: string, conditionalSelector: string, shouldBeVisible: boolean) {
  const trigger = page.locator(triggerSelector);
  await trigger.click();
  
  const conditional = page.locator(conditionalSelector);
  
  if (shouldBeVisible) {
    await expect(conditional).toBeVisible();
  } else {
    await expect(conditional).toBeHidden();
  }
}

/**
 * Helper for form draft saving
 */
export async function saveDraft(page: Page, draftButtonSelector: string = '[data-testid="save-draft"]') {
  const draftButton = page.locator(draftButtonSelector);
  await expect(draftButton).toBeVisible();
  await draftButton.click();
  
  // Verify draft saved message
  await expect(page.locator('text="Draft saved", [data-testid="draft-saved"]')).toBeVisible();
}

/**
 * Helper for form progress tracking
 */
export async function verifyFormProgress(page: Page, expectedProgress: number) {
  const progressBar = page.locator('[data-testid="form-progress"], .progress-bar');
  await expect(progressBar).toBeVisible();
  
  // Check progress value (assuming it's a percentage)
  const progressValue = await progressBar.getAttribute('aria-valuenow');
  expect(parseInt(progressValue || '0')).toBe(expectedProgress);
}