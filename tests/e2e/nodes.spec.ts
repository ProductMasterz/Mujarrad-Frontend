import { test, expect } from '@playwright/test';

test.describe('Node Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a workspace (assumes test workspace exists)
    await page.goto('/workspaces/test-workspace/nodes');
  });

  test('should display nodes page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /nodes/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Node' })).toBeVisible();
  });

  test('should open create node dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Node' }).click();

    await expect(page.getByRole('heading', { name: 'Create Node' })).toBeVisible();
    await expect(page.getByLabel('Title')).toBeVisible();
    await expect(page.getByLabel('Type')).toBeVisible();
    await expect(page.getByLabel(/content.*markdown/i)).toBeVisible();
  });

  test('should validate node title', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Node' }).click();
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(/title is required/i)).toBeVisible();
  });

  test('should select node type', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Node' }).click();

    await page.getByLabel('Type').click();
    await expect(page.getByText('Regular')).toBeVisible();
    await expect(page.getByText('Context')).toBeVisible();
    await expect(page.getByText('Assumption')).toBeVisible();
  });

  test('should allow markdown input', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Node' }).click();

    const markdownContent = '# Test Node\n\nThis is **bold** text.';
    await page.getByLabel(/content.*markdown/i).fill(markdownContent);

    const value = await page.getByLabel(/content.*markdown/i).inputValue();
    expect(value).toBe(markdownContent);
  });

  test('should display node list', async ({ page }) => {
    // Assumes at least one node exists
    await expect(page.locator('[data-testid="node-card"]').first()).toBeVisible();
  });

  test('should filter nodes by type', async ({ page }) => {
    await page.getByRole('combobox', { name: /filter.*type/i }).click();
    await page.getByText('Context').click();

    // All visible nodes should be of type Context
    const nodeTypes = page.locator('[data-testid="node-type"]');
    await expect(nodeTypes.first()).toContainText('Context');
  });

  test('should open node details on click', async ({ page }) => {
    const firstNode = page.locator('[data-testid="node-card"]').first();
    await firstNode.click();

    await expect(page).toHaveURL(/\/nodes\/[a-f0-9-]+$/);
  });

  test('should display empty state when no nodes', async ({ page }) => {
    // Assumes no nodes exist
    await expect(page.getByText(/no nodes yet/i)).toBeVisible();
  });

  test('should validate title length', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Node' }).click();

    await page.getByLabel('Title').fill('ab'); // Too short
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(/title must be at least/i)).toBeVisible();
  });

  test('should display node metadata', async ({ page }) => {
    // Assumes at least one node exists
    const nodeCard = page.locator('[data-testid="node-card"]').first();

    await expect(nodeCard.locator('[data-testid="node-title"]')).toBeVisible();
    await expect(nodeCard.locator('[data-testid="node-type"]')).toBeVisible();
    await expect(nodeCard.locator('[data-testid="node-date"]')).toBeVisible();
  });
});
