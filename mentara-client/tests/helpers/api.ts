import { Page, expect, APIResponse } from '@playwright/test';

/**
 * Helper to wait for API calls and verify responses
 */
export async function waitForApiCall(
  page: Page, 
  urlPattern: string | RegExp, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
): Promise<APIResponse> {
  const responsePromise = page.waitForResponse(response => {
    const url = response.url();
    const responseMethod = response.request().method();
    
    const urlMatches = typeof urlPattern === 'string' 
      ? url.includes(urlPattern)
      : urlPattern.test(url);
      
    return urlMatches && responseMethod === method;
  });
  
  const response = await responsePromise;
  
  // Verify the response is successful
  expect(response.status()).toBeLessThan(400);
  
  return response;
}

/**
 * Helper to mock API responses for testing error states
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  responseData: any,
  status: number = 200
) {
  await page.route(urlPattern, async route => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(responseData)
    });
  });
}

/**
 * Helper to verify loading states
 */
export async function verifyLoadingState(page: Page, selector: string) {
  // Check that loading indicator appears
  await expect(page.locator(selector)).toBeVisible();
  
  // Wait for loading to complete
  await expect(page.locator(selector)).toBeHidden({ timeout: 10000 });
}

/**
 * Helper to verify error states
 */
export async function verifyErrorState(page: Page, errorMessage?: string) {
  const errorSelector = '[data-testid="error-message"], .error, [role="alert"]';
  await expect(page.locator(errorSelector)).toBeVisible();
  
  if (errorMessage) {
    await expect(page.locator(errorSelector)).toContainText(errorMessage);
  }
}

/**
 * Helper to verify empty states
 */
export async function verifyEmptyState(page: Page, message?: string) {
  const emptySelector = '[data-testid="empty-state"], .empty-state';
  await expect(page.locator(emptySelector)).toBeVisible();
  
  if (message) {
    await expect(page.locator(emptySelector)).toContainText(message);
  }
}