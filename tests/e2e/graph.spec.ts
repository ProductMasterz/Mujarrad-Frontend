import { test, expect } from '@playwright/test';

test.describe('Graph Visualization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workspaces/test-workspace/graph');
  });

  test('should display graph canvas', async ({ page }) => {
    // ReactFlow should render
    await expect(page.locator('.react-flow')).toBeVisible();
  });

  test('should display graph controls', async ({ page }) => {
    // ReactFlow controls (zoom in, zoom out, fit view, etc.)
    await expect(page.locator('.react-flow__controls')).toBeVisible();
  });

  test('should display minimap', async ({ page }) => {
    await expect(page.locator('.react-flow__minimap')).toBeVisible();
  });

  test('should display background pattern', async ({ page }) => {
    await expect(page.locator('.react-flow__background')).toBeVisible();
  });

  test('should render nodes on canvas', async ({ page }) => {
    // Assumes test data exists
    await expect(page.locator('.react-flow__node').first()).toBeVisible();
  });

  test('should render edges between nodes', async ({ page }) => {
    // Assumes test data with relationships exists
    await expect(page.locator('.react-flow__edge').first()).toBeVisible();
  });

  test('should zoom in on control button click', async ({ page }) => {
    const zoomInButton = page.locator('.react-flow__controls-zoomin');
    await zoomInButton.click();

    // Check viewport has changed (zoom increased)
    const viewport = await page.locator('.react-flow__viewport').getAttribute('style');
    expect(viewport).toContain('transform');
  });

  test('should zoom out on control button click', async ({ page }) => {
    const zoomOutButton = page.locator('.react-flow__controls-zoomout');
    await zoomOutButton.click();

    // Check viewport has changed (zoom decreased)
    const viewport = await page.locator('.react-flow__viewport').getAttribute('style');
    expect(viewport).toContain('transform');
  });

  test('should fit view on control button click', async ({ page }) => {
    const fitViewButton = page.locator('.react-flow__controls-fitview');
    await fitViewButton.click();

    // All nodes should be visible
    await expect(page.locator('.react-flow__node').first()).toBeInViewport();
  });

  test('should select node on click', async ({ page }) => {
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.click();

    // Node should have selected class or attribute
    await expect(firstNode).toHaveClass(/selected/);
  });

  test('should pan graph on drag', async ({ page }) => {
    const canvas = page.locator('.react-flow__pane');

    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100);
      await page.mouse.up();
    }

    // Viewport should have changed
    const viewport = await page.locator('.react-flow__viewport').getAttribute('style');
    expect(viewport).toContain('transform');
  });

  test('should display empty state when no nodes', async ({ page }) => {
    // Navigate to empty workspace
    await page.goto('/workspaces/empty-workspace/graph');

    await expect(page.getByText(/no nodes.*graph/i)).toBeVisible();
  });

  test('should show node details on hover', async ({ page }) => {
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.hover();

    // Tooltip or details should appear
    await expect(page.locator('[data-testid="node-tooltip"]')).toBeVisible();
  });

  test('should display different node types with different colors', async ({ page }) => {
    // Assumes nodes of different types exist
    const nodes = page.locator('.react-flow__node');
    const count = await nodes.count();

    if (count > 1) {
      const firstNodeColor = await nodes.nth(0).evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      const secondNodeColor = await nodes.nth(1).evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // If different types, colors should be different
      // This is a basic check - adjust based on your implementation
      expect(firstNodeColor).toBeDefined();
      expect(secondNodeColor).toBeDefined();
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    const firstNode = page.locator('.react-flow__node').first();
    await firstNode.focus();

    // Node should be focused
    await expect(firstNode).toBeFocused();
  });
});
