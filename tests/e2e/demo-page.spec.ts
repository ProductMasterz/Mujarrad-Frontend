import { test, expect } from '@playwright/test';

test.describe('Demo Page - UI Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/demo');
  });

  test('should display page header and sections', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: 'UI Components Demo' })).toBeVisible();

    // Check section headers
    await expect(page.getByRole('heading', { name: /Hierarchy Navigator/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Markdown Renderer/i })).toBeVisible();
  });

  test('should display hierarchy tree with nodes', async ({ page }) => {
    // Check for tree role
    const tree = page.getByRole('tree');
    await expect(tree).toBeVisible();

    // Check for root nodes
    await expect(page.getByText('Product Requirements')).toBeVisible();
    await expect(page.getByText('Technical Specs')).toBeVisible();
  });

  test('should expand/collapse hierarchy nodes on click', async ({ page }) => {
    // Find the Product Requirements node
    const productReqNode = page.getByRole('treeitem', { name: /Product Requirements/i }).first();
    await expect(productReqNode).toBeVisible();

    // Check initial state (collapsed)
    await expect(productReqNode).toHaveAttribute('aria-expanded', 'false');

    // Click to expand
    await productReqNode.click();

    // Wait a bit for state update
    await page.waitForTimeout(100);

    // Verify expanded state
    await expect(productReqNode).toHaveAttribute('aria-expanded', 'true');

    // Child nodes should now be visible
    await expect(page.getByText('User Authentication')).toBeVisible();
    await expect(page.getByText('Authorization')).toBeVisible();
  });

  test('should display markdown content with formatting', async ({ page }) => {
    // Check markdown heading
    const markdownSection = page.locator('.prose');
    await expect(markdownSection).toBeVisible();

    // Check for markdown content elements
    await expect(markdownSection.getByRole('heading', { name: 'Markdown Renderer Demo' })).toBeVisible();
    await expect(markdownSection.getByRole('heading', { name: 'Features' })).toBeVisible();

    // Check for bold text
    await expect(markdownSection.locator('text=Bold text').first()).toBeVisible();

    // Check for code block
    await expect(markdownSection.locator('pre code')).toBeVisible();
  });

  test('should render wiki-links with correct styling', async ({ page }) => {
    const markdownSection = page.locator('.prose');

    // Check for resolved wiki-links (blue/existing)
    const resolvedLink = markdownSection.locator('a:has-text("User Authentication")').first();
    await expect(resolvedLink).toBeVisible();
    await expect(resolvedLink).toHaveClass(/text-blue/);

    // Check for placeholder wiki-links (red/non-existing)
    const placeholderLink = markdownSection.locator('span:has-text("Security Best Practices")').first();
    await expect(placeholderLink).toBeVisible();
    await expect(placeholderLink).toHaveClass(/text-red/);
  });

  test('should render GFM table', async ({ page }) => {
    const markdownSection = page.locator('.prose');

    // Check for table
    const table = markdownSection.locator('table');
    await expect(table).toBeVisible();

    // Check table headers
    await expect(table.locator('th:has-text("Feature")')).toBeVisible();
    await expect(table.locator('th:has-text("Status")')).toBeVisible();

    // Check table content
    await expect(table.locator('td:has-text("Hierarchy UI")')).toBeVisible();
    await expect(table.locator('td:has-text("✅ Complete")')).toBeVisible();
  });

  test('should render task lists', async ({ page }) => {
    const markdownSection = page.locator('.prose');

    // Check for task list items
    const taskList = markdownSection.locator('ul').filter({ hasText: 'wiki-link parsing' });
    await expect(taskList).toBeVisible();

    // Check for checked and unchecked items
    await expect(taskList.locator('input[type="checkbox"][checked]').first()).toBeVisible();
    await expect(taskList.locator('input[type="checkbox"]:not([checked])').first()).toBeVisible();
  });

  test('should handle keyboard navigation in hierarchy', async ({ page }) => {
    // Focus on first tree item
    const firstNode = page.getByRole('treeitem').first();
    await firstNode.focus();

    // Press Enter to select/expand
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);

    // Verify interaction (check for aria-expanded change)
    const ariaExpanded = await firstNode.getAttribute('aria-expanded');
    expect(ariaExpanded).toBe('true');

    // Press ArrowDown to navigate
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    // Next item should be focused
    const secondNode = page.getByRole('treeitem').nth(1);
    await expect(secondNode).toBeFocused();
  });

  test('should log console messages on interactions', async ({ page }) => {
    const consoleLogs: string[] = [];

    // Capture console logs
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    // Expand a node (should trigger onNodeSelect)
    const productReqNode = page.getByRole('treeitem', { name: /Product Requirements/i }).first();
    await productReqNode.click();
    await page.waitForTimeout(200);

    // Click a wiki-link (should trigger onWikiLinkClick)
    await page.getByRole('treeitem', { name: /Product Requirements/i }).first().click();
    await page.waitForTimeout(200);

    // Verify console logs
    expect(consoleLogs.length).toBeGreaterThan(0);
    expect(consoleLogs.some(log => log.includes('Selected'))).toBeTruthy();
  });
});
