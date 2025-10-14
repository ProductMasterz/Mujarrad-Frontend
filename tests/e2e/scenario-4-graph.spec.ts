import { test, expect } from '@playwright/test';

/**
 * T082: E2E Test - Graph view → toggle filters → verify nodes shown/hidden
 */

test.describe('Scenario 4: Graph View Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    await page.fill('input[name="email"]', 'omar.h.shafeek@gmail.com');
    await page.fill('input[name="password"]', 'Om@r1234');
    await page.click('button:has-text("Sign in")');
    await page.waitForURL('**/spaces');
    await page.click('text=Demo Space');
    await page.waitForURL('**/space/demo-space');
  });

  test('should toggle CONTEXT nodes visibility', async ({ page }) => {
    await page.click('text=Graph');
    await page.waitForTimeout(1000);

    const initialContextCount = await page.locator('[data-node-type="context"]').count();

    // Toggle off CONTEXT nodes
    await page.click('input[aria-label*="Show context nodes"]');
    await page.waitForTimeout(500);

    const hiddenContextCount = await page.locator('[data-node-type="context"]').count();
    expect(hiddenContextCount).toBe(0);

    // Toggle back on
    await page.click('input[aria-label*="Show context nodes"]');
    await page.waitForTimeout(500);

    const restoredContextCount = await page.locator('[data-node-type="context"]').count();
    expect(restoredContextCount).toBe(initialContextCount);
  });

  test('should toggle REGULAR nodes visibility', async ({ page }) => {
    await page.click('text=Graph');
    await page.waitForTimeout(1000);

    const initialRegularCount = await page.locator('[data-node-type="regular"]').count();

    await page.click('input[aria-label*="Show regular nodes"]');
    await page.waitForTimeout(500);

    const hiddenRegularCount = await page.locator('[data-node-type="regular"]').count();
    expect(hiddenRegularCount).toBe(0);
  });

  test('should toggle hierarchy edges visibility', async ({ page }) => {
    await page.click('text=Graph');
    await page.waitForTimeout(1000);

    const initialContainsEdges = await page.locator('[data-edge-type="contains"]').count();

    await page.click('input[aria-label*="Show hierarchy"]');
    await page.waitForTimeout(500);

    const hiddenContainsEdges = await page.locator('[data-edge-type="contains"]').count();
    expect(hiddenContainsEdges).toBeLessThan(initialContainsEdges);
  });

  test('should toggle reference edges visibility', async ({ page }) => {
    await page.click('text=Graph');
    await page.waitForTimeout(1000);

    await page.click('input[aria-label*="Show references"]');
    await page.waitForTimeout(500);

    const hiddenRefEdges = await page.locator('[data-edge-type="references"]').count();
    expect(hiddenRefEdges).toBe(0);
  });

  test('should display bidirectional edges distinctly', async ({ page }) => {
    await page.click('text=Graph');
    await page.waitForTimeout(1000);

    const bidiEdges = page.locator('[data-bidirectional="true"]');
    if (await bidiEdges.count() > 0) {
      const firstBidiEdge = bidiEdges.first();
      await expect(firstBidiEdge).toHaveClass(/edge-bidirectional/);
    }
  });

  test('should support pan and zoom interactions', async ({ page }) => {
    await page.click('text=Graph');
    await page.waitForTimeout(1000);

    const graphCanvas = page.locator('[data-testid="react-flow"]');

    // Zoom in using control
    await page.click('button[aria-label*="zoom in"]');
    await page.waitForTimeout(300);

    // Zoom out
    await page.click('button[aria-label*="zoom out"]');
    await page.waitForTimeout(300);

    // Fit view
    await page.click('button[aria-label*="fit view"]');
    await page.waitForTimeout(300);

    expect(await graphCanvas.isVisible()).toBe(true);
  });

  test('should navigate to node on double-click in graph', async ({ page }) => {
    await page.click('text=Graph');
    await page.waitForTimeout(1000);

    const graphNode = page.locator('[data-node-type="regular"]').first();
    if (await graphNode.isVisible()) {
      const nodeTitle = await graphNode.textContent();

      await graphNode.dblclick();
      await page.waitForURL(/\/node\//);

      await expect(page.locator(`h1:has-text("${nodeTitle}")`)).toBeVisible();
    }
  });
});
