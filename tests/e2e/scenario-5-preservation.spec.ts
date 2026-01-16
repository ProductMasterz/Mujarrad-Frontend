import { test, expect } from '@playwright/test';

/**
 * T083: E2E Test - Remove wiki-link from markdown → relationship preserved
 */

test.describe('Scenario 5: Relationship Preservation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    await page.fill('input[name="email"]', 'omar.h.shafeek@gmail.com');
    await page.fill('input[name="password"]', 'Om@r1234');
    await page.click('button:has-text("Sign in")');
    await page.waitForURL('**/spaces');
    await page.click('text=Demo Space');
    await page.waitForURL('**/space/demo-space');
  });

  test('should preserve relationship after removing wiki-link text', async ({ page }) => {
    await page.locator('[data-node-type="REGULAR"]').first().click();
    await page.waitForURL(/\/node\//);

    // Add wiki-link
    await page.click('button:has-text("Edit")');
    const targetPage = `Preserved Link ${Date.now()}`;
    await page.locator('textarea[name="markdownContent"]').fill(`See [[${targetPage}]] here.`);
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(2000);

    // Verify relationship in graph
    await page.click('text=Graph');
    await page.waitForTimeout(1000);
    const initialEdgeCount = await page.locator('[data-testid^="graph-edge-"]').count();

    // Go back to page and remove wiki-link text
    await page.goBack();
    await page.click('button:has-text("Edit")');
    await page.locator('textarea[name="markdownContent"]').fill('No wiki-links here.');
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(2000);

    // Check graph again - edge should still exist
    await page.click('text=Graph');
    await page.waitForTimeout(1000);
    const finalEdgeCount = await page.locator('[data-testid^="graph-edge-"]').count();

    expect(finalEdgeCount).toBe(initialEdgeCount);
  });
});
