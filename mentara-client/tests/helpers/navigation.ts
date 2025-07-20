import { Page, expect } from '@playwright/test';

/**
 * Helper for navigating between pages and verifying navigation
 */
export async function navigateAndVerify(page: Page, url: string, expectedUrl?: string | RegExp) {
  await page.goto(url);
  
  // Use expectedUrl if provided, otherwise use the original url
  const urlToVerify = expectedUrl || url;
  
  if (typeof urlToVerify === 'string') {
    await page.waitForURL(urlToVerify);
  } else {
    await page.waitForURL(urlToVerify);
  }
  
  await page.waitForLoadState('networkidle');
}

/**
 * Helper for sidebar navigation
 */
export async function navigateViaSidebar(page: Page, linkText: string) {
  const sidebarLink = page.locator(`[data-testid="sidebar"] a, nav a`).filter({ hasText: linkText });
  await expect(sidebarLink).toBeVisible();
  await sidebarLink.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Helper for main navigation
 */
export async function navigateViaMainNav(page: Page, linkText: string) {
  const navLink = page.locator(`nav a, [role="navigation"] a`).filter({ hasText: linkText });
  await expect(navLink).toBeVisible();
  await navLink.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Helper for breadcrumb navigation
 */
export async function navigateViaBreadcrumb(page: Page, breadcrumbText: string) {
  const breadcrumb = page.locator(`[data-testid="breadcrumb"] a, .breadcrumb a`).filter({ hasText: breadcrumbText });
  await expect(breadcrumb).toBeVisible();
  await breadcrumb.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Helper for back navigation
 */
export async function navigateBack(page: Page) {
  await page.goBack();
  await page.waitForLoadState('networkidle');
}

/**
 * Helper for forward navigation
 */
export async function navigateForward(page: Page) {
  await page.goForward();
  await page.waitForLoadState('networkidle');
}

/**
 * Helper to verify current page/URL
 */
export async function verifyCurrentPage(page: Page, expectedUrl: string | RegExp) {
  if (typeof expectedUrl === 'string') {
    await expect(page).toHaveURL(expectedUrl);
  } else {
    await expect(page).toHaveURL(expectedUrl);
  }
}

/**
 * Helper to wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Small buffer for any final renders
}

/**
 * Helper to verify page title
 */
export async function verifyPageTitle(page: Page, expectedTitle: string | RegExp) {
  if (typeof expectedTitle === 'string') {
    await expect(page).toHaveTitle(expectedTitle);
  } else {
    await expect(page).toHaveTitle(expectedTitle);
  }
}

/**
 * Helper to verify page heading
 */
export async function verifyPageHeading(page: Page, expectedHeading: string | RegExp) {
  const heading = page.locator('h1, h2, [data-testid="page-heading"]');
  
  if (typeof expectedHeading === 'string') {
    await expect(heading).toHaveText(expectedHeading);
  } else {
    await expect(heading).toHaveText(expectedHeading);
  }
}

/**
 * Helper to check if user is on expected role page
 */
export async function verifyRoleBasedPage(page: Page, expectedRole: 'user' | 'therapist' | 'admin' | 'moderator') {
  await expect(page).toHaveURL(new RegExp(`/${expectedRole}/`));
}

/**
 * Helper to verify protected page access
 */
export async function verifyProtectedAccess(page: Page, shouldHaveAccess: boolean = true) {
  if (shouldHaveAccess) {
    // Should not be redirected to login
    await expect(page).not.toHaveURL(/sign-in/);
    await expect(page).not.toHaveURL(/landing/);
  } else {
    // Should be redirected to login or landing
    await expect(page).toHaveURL(/sign-in|landing/);
  }
}

/**
 * Helper to refresh page and verify it loads correctly
 */
export async function refreshAndVerify(page: Page, expectedUrl?: string | RegExp) {
  await page.reload();
  await waitForPageLoad(page);
  
  if (expectedUrl) {
    await verifyCurrentPage(page, expectedUrl);
  }
}

/**
 * Helper to handle modal navigation
 */
export async function openModal(page: Page, triggerSelector: string) {
  await page.locator(triggerSelector).click();
  await page.waitForSelector('[role="dialog"], .modal, [data-testid="modal"]');
}

/**
 * Helper to close modal
 */
export async function closeModal(page: Page) {
  // Try multiple ways to close modal
  const closeButton = page.locator('[data-testid="close-modal"], .modal-close, [aria-label="Close"]');
  
  if (await closeButton.isVisible()) {
    await closeButton.click();
  } else {
    // Try pressing Escape
    await page.keyboard.press('Escape');
  }
  
  // Wait for modal to close
  await page.waitForSelector('[role="dialog"], .modal, [data-testid="modal"]', { state: 'hidden' });
}

/**
 * Helper to verify modal is open
 */
export async function verifyModalOpen(page: Page, modalTitle?: string) {
  await expect(page.locator('[role="dialog"], .modal, [data-testid="modal"]')).toBeVisible();
  
  if (modalTitle) {
    await expect(page.locator(`text="${modalTitle}"`)).toBeVisible();
  }
}

/**
 * Helper to verify modal is closed
 */
export async function verifyModalClosed(page: Page) {
  await expect(page.locator('[role="dialog"], .modal, [data-testid="modal"]')).toBeHidden();
}