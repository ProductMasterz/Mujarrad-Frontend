import { test, expect } from '@playwright/test';

/**
 * T081: E2E Test - Edit page → add wiki-link → placeholder created → relationship in graph
 */

test.describe('Scenario 3: Placeholder Page Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    await page.fill('input[name="email"]', 'omar.h.shafeek@gmail.com');
    await page.fill('input[name="password"]', 'Om@r1234');
    await page.click('button:has-text("Sign in")');
    await page.waitForURL('**/workspaces');
    await page.click('text=Demo Workspace');
    await page.waitForURL('**/workspace/demo-workspace');
  });

  test('should create placeholder page when wiki-link to non-existent page saved', async ({ page }) => {
    // Navigate to a page
    await page.locator('[data-node-type="REGULAR"]').first().click();
    await page.waitForURL(/\/node\//);

    // Click edit button
    await page.click('button:has-text("Edit")');

    // Add wiki-link to non-existent page
    const uniquePageName = `Test Page ${Date.now()}`;
    await page.locator('textarea[name="markdownContent"]').fill(`# Test\n\nSee [[${uniquePageName}]] for more.`);

    // Save
    await page.click('button:has-text("Save")');

    // Wait for success toast
    await expect(page.locator('text=Creating new page')).toBeVisible({ timeout: 5000 });

    // Verify placeholder page appears in tree
    await expect(page.locator(`[data-testid="node-title"]:has-text("${uniquePageName}")`)).toBeVisible({ timeout: 10000 });
  });

  test('should create relationship visible in graph', async ({ page }) => {
    await page.locator('[data-node-type="REGULAR"]').first().click();
    await page.waitForURL(/\/node\//);
    const sourceNodeUrl = page.url();

    // Edit and add wiki-link
    await page.click('button:has-text("Edit")');
    const targetPageName = `Graph Test ${Date.now()}`;
    await page.locator('textarea[name="markdownContent"]').fill(`[[${targetPageName}]]`);
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(2000);

    // Navigate to graph view
    await page.click('text=Graph');
    await page.waitForTimeout(1000);

    // Verify edge exists in graph
    const graphEdges = page.locator('[data-testid^="graph-edge-"]');
    expect(await graphEdges.count()).toBeGreaterThan(0);
  });

  test('should allow editing placeholder page', async ({ page }) => {
    await page.locator('[data-node-type="REGULAR"]').first().click();
    await page.waitForURL(/\/node\//);

    // Create placeholder
    await page.click('button:has-text("Edit")');
    const placeholderName = `Editable Placeholder ${Date.now()}`;
    await page.locator('textarea[name="markdownContent"]').fill(`[[${placeholderName}]]`);
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(2000);

    // Click on the wiki-link to navigate to placeholder
    await page.click(`text=${placeholderName}`);
    await page.waitForURL(/\/node\//);

    // Verify it's a placeholder (empty or minimal content)
    const content = await page.locator('[data-testid="markdown-content"]').textContent();
    expect(content?.trim().length || 0).toBeLessThan(50);

    // Edit the placeholder
    await page.click('button:has-text("Edit")');
    await page.locator('textarea[name="markdownContent"]').fill('# Now has content\n\nThis was a placeholder.');
    await page.click('button:has-text("Save")');

    // Verify content saved
    await expect(page.locator('text=Now has content')).toBeVisible();
  });
});
