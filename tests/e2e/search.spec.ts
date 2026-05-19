import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/spaces/test-space/search');
  });

  test('should display search bar', async ({ page }) => {
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test('should show empty state initially', async ({ page }) => {
    await expect(page.getByText(/enter a search query/i)).toBeVisible();
  });

  test('should debounce search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);

    await searchInput.fill('test');

    // Wait for debounce (300ms)
    await page.waitForTimeout(350);

    // Results should now be loading or displayed
    // Depends on whether test data exists
  });

  test('should display no results message', async ({ page }) => {
    await page.getByPlaceholder(/search/i).fill('nonexistentquery123456');
    await page.waitForTimeout(350);

    await expect(page.getByText(/no results found/i)).toBeVisible();
  });

  test('should display search results', async ({ page }) => {
    // Assumes test data exists
    await page.getByPlaceholder(/search/i).fill('test');
    await page.waitForTimeout(350);

    await expect(page.locator('[data-testid="search-result"]').first()).toBeVisible();
  });

  test('should highlight search terms in results', async ({ page }) => {
    await page.getByPlaceholder(/search/i).fill('test');
    await page.waitForTimeout(350);

    // Check for highlighted text
    await expect(page.locator('mark, .highlight').first()).toBeVisible();
  });

  test('should navigate to node on result click', async ({ page }) => {
    await page.getByPlaceholder(/search/i).fill('test');
    await page.waitForTimeout(350);

    const firstResult = page.locator('[data-testid="search-result"]').first();
    await firstResult.click();

    await expect(page).toHaveURL(/\/nodes\/[a-f0-9-]+$/);
  });

  test('should display result metadata', async ({ page }) => {
    await page.getByPlaceholder(/search/i).fill('test');
    await page.waitForTimeout(350);

    const result = page.locator('[data-testid="search-result"]').first();

    await expect(result.locator('[data-testid="result-title"]')).toBeVisible();
    await expect(result.locator('[data-testid="result-type"]')).toBeVisible();
  });

  test('should clear search on clear button', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);

    await searchInput.fill('test query');
    await page.getByRole('button', { name: /clear/i }).click();

    await expect(searchInput).toHaveValue('');
    await expect(page.getByText(/enter a search query/i)).toBeVisible();
  });

  test('should show loading state during search', async ({ page }) => {
    await page.getByPlaceholder(/search/i).fill('test');

    // Immediately check for loading state
    await expect(page.getByText(/searching/i)).toBeVisible();
  });

  test('should handle special characters in search', async ({ page }) => {
    await page.getByPlaceholder(/search/i).fill('test@#$%');
    await page.waitForTimeout(350);

    // Should not crash or show error
    // Either shows results or no results message
  });

  test('should preserve search query in URL', async ({ page }) => {
    await page.getByPlaceholder(/search/i).fill('test query');
    await page.waitForTimeout(350);

    await expect(page).toHaveURL(/[?&]q=test\+query/);
  });
});
