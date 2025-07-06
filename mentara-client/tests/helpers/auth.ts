import { Page, expect } from '@playwright/test';

export interface TestAccount {
  email: string;
  password: string;
  role: 'client' | 'therapist' | 'moderator' | 'admin';
  clerkUserId: string;
}

// Test accounts from test-accounts.md
export const TEST_ACCOUNTS: Record<string, TestAccount> = {
  basicClient: {
    email: 'test.client.basic@mentaratest.dev',
    password: 'MentaraTest2024$Client1!',
    role: 'client',
    clerkUserId: 'user_2z5S2iaKkRuHpe3BygkU0R3NnDu'
  },
  completeClient: {
    email: 'test.client.complete@mentaratest.dev',
    password: 'MentaraTest2024$Client2!',
    role: 'client',
    clerkUserId: 'user_2z5S4N84dgKfWuXzXGYjtXbkWVC'
  },
  approvedTherapist: {
    email: 'test.therapist.approved@mentaratest.dev',
    password: 'MentaraTest2024$Therapist1!',
    role: 'therapist',
    clerkUserId: 'user_2z5S92KNAdBfAg5sBvMAtZvMiIz'
  },
  pendingTherapist: {
    email: 'test.therapist.pending@mentaratest.dev',
    password: 'MentaraTest2024$Therapist2!',
    role: 'therapist',
    clerkUserId: 'user_2z5SBGCUI2ypqCYmIMEanA335FT'
  },
  superAdmin: {
    email: 'test.admin.super@mentaratest.dev',
    password: 'MentaraTest2024$Admin1!',
    role: 'admin',
    clerkUserId: 'user_2z5SQlOzBOgmVn6KStIDToQViDA'
  }
};

/**
 * Login helper function for Playwright tests
 */
export async function loginAs(page: Page, accountKey: keyof typeof TEST_ACCOUNTS) {
  const account = TEST_ACCOUNTS[accountKey];
  
  // Navigate to login page
  await page.goto('/sign-in');
  
  // Fill in credentials
  await page.fill('input[name="identifier"]', account.email);
  await page.fill('input[name="password"]', account.password);
  
  // Submit login form
  await page.click('button[type="submit"]');
  
  // Wait for successful login and redirect
  await page.waitForURL(/\/(user|therapist|admin)\//, { timeout: 10000 });
  
  // Verify we're logged in by checking for user-specific content
  await expect(page.locator('[data-testid="user-menu"], [data-testid="sidebar"]')).toBeVisible();
}

/**
 * Logout helper function
 */
export async function logout(page: Page) {
  // Look for user menu or profile dropdown
  const userMenu = page.locator('[data-testid="user-menu"]');
  
  if (await userMenu.isVisible()) {
    await userMenu.click();
    await page.click('text=Sign out');
  } else {
    // Alternative: navigate to sign-out URL
    await page.goto('/sign-out');
  }
  
  // Wait for redirect to landing page
  await page.waitForURL('/');
}

/**
 * Setup authenticated page state for tests
 */
export async function setupAuthenticatedPage(page: Page, accountKey: keyof typeof TEST_ACCOUNTS) {
  await loginAs(page, accountKey);
  
  // Wait for any initial loading to complete
  await page.waitForLoadState('networkidle');
  
  return TEST_ACCOUNTS[accountKey];
}