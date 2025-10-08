import { test, expect } from '@playwright/test';

/**
 * T079: E2E Test - Login → workspace → browse hierarchy → navigate to page
 *
 * User Story: Browse pages organized in folders, expand/collapse tree, navigate to pages
 */

test.describe('Scenario 1: Hierarchy Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3001/login');
    await page.fill('input[name="email"]', 'omar.h.shafeek@gmail.com');
    await page.fill('input[name="password"]', 'Om@r1234');
    await page.click('button:has-text("Sign in")');

    // Wait for redirect to workspaces page
    await page.waitForURL('**/workspaces');
  });

  test('should navigate to workspace and see hierarchy tree', async ({ page }) => {
    // Select workspace
    await page.click('text=Demo Workspace');

    // Wait for workspace page to load
    await page.waitForURL('**/workspace/demo-workspace');

    // Verify hierarchy sidebar is visible
    const hierarchySidebar = page.locator('[data-testid="hierarchy-sidebar"]');
    await expect(hierarchySidebar).toBeVisible();

    // Verify root nodes are displayed
    await expect(page.locator('[role="treeitem"]')).toHaveCount(greaterThan(0));
  });

  test('should display folder and document icons correctly', async ({ page }) => {
    await page.click('text=Demo Workspace');
    await page.waitForURL('**/workspace/demo-workspace');

    // Check for folder icon on CONTEXT nodes
    const contextNode = page.locator('[data-node-type="CONTEXT"]').first();
    await expect(contextNode.locator('[data-testid="folder-icon"]')).toBeVisible();

    // Expand folder to see children
    const expandButton = contextNode.locator('button[aria-label*="Expand"]');
    if (await expandButton.isVisible()) {
      await expandButton.click();

      // Check for document icon on REGULAR nodes
      const regularNode = page.locator('[data-node-type="REGULAR"]').first();
      await expect(regularNode.locator('[data-testid="document-icon"]')).toBeVisible();
    }
  });

  test('should expand and collapse folder nodes', async ({ page }) => {
    await page.click('text=Demo Workspace');
    await page.waitForURL('**/workspace/demo-workspace');

    // Find a CONTEXT node (folder)
    const folderNode = page.locator('[data-node-type="CONTEXT"]').first();
    const folderTitle = await folderNode.locator('[data-testid="node-title"]').textContent();

    // Click expand button
    const expandButton = folderNode.locator('button[aria-label*="Expand"]');
    await expandButton.click();

    // Wait for children to appear
    await page.waitForTimeout(500); // Animation delay

    // Verify children are visible (check for increased tree item count)
    const expandedCount = await page.locator('[role="treeitem"]').count();

    // Click collapse button
    const collapseButton = folderNode.locator('button[aria-label*="Collapse"]');
    await collapseButton.click();

    // Wait for children to disappear
    await page.waitForTimeout(500);

    // Verify children are hidden
    const collapsedCount = await page.locator('[role="treeitem"]').count();
    expect(collapsedCount).toBeLessThan(expandedCount);
  });

  test('should navigate to page when clicked', async ({ page }) => {
    await page.click('text=Demo Workspace');
    await page.waitForURL('**/workspace/demo-workspace');

    // Expand a folder to see pages
    const expandButton = page.locator('button[aria-label*="Expand"]').first();
    if (await expandButton.isVisible()) {
      await expandButton.click();
      await page.waitForTimeout(500);
    }

    // Click on a page node
    const pageNode = page.locator('[data-node-type="REGULAR"]').first();
    const pageTitle = await pageNode.locator('[data-testid="node-title"]').textContent();
    await pageNode.click();

    // Verify URL changed to node detail page
    await expect(page).toHaveURL(/\/workspace\/demo-workspace\/node\/[a-zA-Z0-9-]+/);

    // Verify page content is displayed
    await expect(page.locator('[data-testid="node-detail-view"]')).toBeVisible();

    // Verify page title is shown
    await expect(page.locator('h1')).toContainText(pageTitle || '');
  });

  test('should highlight selected node in tree', async ({ page }) => {
    await page.click('text=Demo Workspace');
    await page.waitForURL('**/workspace/demo-workspace');

    // Expand to see pages
    const expandButton = page.locator('button[aria-label*="Expand"]').first();
    if (await expandButton.isVisible()) {
      await expandButton.click();
      await page.waitForTimeout(500);
    }

    // Click on a page
    const pageNode = page.locator('[data-node-type="REGULAR"]').first();
    await pageNode.click();

    // Verify node is highlighted
    await expect(pageNode).toHaveClass(/selected/);
    await expect(pageNode).toHaveAttribute('aria-selected', 'true');
  });

  test('should support keyboard navigation in tree', async ({ page }) => {
    await page.click('text=Demo Workspace');
    await page.waitForURL('**/workspace/demo-workspace');

    // Focus first tree item
    const firstNode = page.locator('[role="treeitem"]').first();
    await firstNode.focus();

    // Press ArrowDown to navigate
    await page.keyboard.press('ArrowDown');

    // Verify focus moved
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('role', 'treeitem');

    // Press Enter to select
    await page.keyboard.press('Enter');

    // Verify navigation occurred
    await expect(page).toHaveURL(/\/workspace\/demo-workspace\/node\/[a-zA-Z0-9-]+/);
  });

  test('should persist expand/collapse state during navigation', async ({ page }) => {
    await page.click('text=Demo Workspace');
    await page.waitForURL('**/workspace/demo-workspace');

    // Expand a folder
    const expandButton = page.locator('button[aria-label*="Expand"]').first();
    const folderNode = expandButton.locator('..').locator('..');
    await expandButton.click();
    await page.waitForTimeout(500);

    const expandedCount = await page.locator('[role="treeitem"]').count();

    // Navigate to a page
    const pageNode = page.locator('[data-node-type="REGULAR"]').first();
    await pageNode.click();

    // Wait for page to load
    await page.waitForURL(/\/node\//);

    // Verify tree still shows expanded state
    const currentCount = await page.locator('[role="treeitem"]').count();
    expect(currentCount).toBe(expandedCount);
  });

  test('should support multi-level hierarchy navigation', async ({ page }) => {
    await page.click('text=Demo Workspace');
    await page.waitForURL('**/workspace/demo-workspace');

    // Expand root folder
    const rootExpandButton = page.locator('[role="treeitem"]').first().locator('button[aria-label*="Expand"]');
    if (await rootExpandButton.isVisible()) {
      await rootExpandButton.click();
      await page.waitForTimeout(500);

      // Look for nested folders
      const nestedFolders = page.locator('[data-node-type="CONTEXT"][data-level="1"]');
      if (await nestedFolders.count() > 0) {
        // Expand nested folder
        const nestedExpandButton = nestedFolders.first().locator('button[aria-label*="Expand"]');
        if (await nestedExpandButton.isVisible()) {
          await nestedExpandButton.click();
          await page.waitForTimeout(500);

          // Verify deeply nested items are visible
          await expect(page.locator('[data-level="2"]')).toHaveCount(greaterThan(0));
        }
      }
    }
  });

  test('should show correct indentation for tree levels', async ({ page }) => {
    await page.click('text=Demo Workspace');
    await page.waitForURL('**/workspace/demo-workspace');

    // Get root node padding
    const rootNode = page.locator('[role="treeitem"][data-level="0"]').first();
    const rootPadding = await rootNode.evaluate((el) =>
      window.getComputedStyle(el).paddingLeft
    );

    // Expand to see children
    const expandButton = rootNode.locator('button[aria-label*="Expand"]');
    if (await expandButton.isVisible()) {
      await expandButton.click();
      await page.waitForTimeout(500);

      // Get child node padding
      const childNode = page.locator('[role="treeitem"][data-level="1"]').first();
      const childPadding = await childNode.evaluate((el) =>
        window.getComputedStyle(el).paddingLeft
      );

      // Verify child has more padding
      expect(parseInt(childPadding)).toBeGreaterThan(parseInt(rootPadding));
    }
  });
});

function greaterThan(n: number) {
  return (actual: number) => actual > n;
}
