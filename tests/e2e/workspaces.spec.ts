import { test, expect } from '@playwright/test';

test.describe('Workspace Management', () => {
  test.beforeEach(async ({ page }) => {
    // Note: In real tests, you'd need to login first
    // This assumes you have a test user or mock auth
    await page.goto('/workspaces');
  });

  test('should display workspaces page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /workspaces/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Workspace' })).toBeVisible();
  });

  test('should open create workspace dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Workspace' }).click();

    await expect(page.getByRole('heading', { name: 'Create Workspace' })).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Slug')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
  });

  test('should validate workspace form', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Workspace' }).click();
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(/name is required/i)).toBeVisible();
    await expect(page.getByText(/slug must be at least/i)).toBeVisible();
  });

  test('should validate slug format', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Workspace' }).click();

    await page.getByLabel('Slug').fill('Invalid Slug!');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(/lowercase letters.*numbers.*hyphens/i)).toBeVisible();
  });

  test('should display empty state when no workspaces', async ({ page }) => {
    // Assumes no workspaces exist
    await expect(page.getByText(/no workspaces yet/i)).toBeVisible();
  });

  test('should auto-generate slug from name', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Workspace' }).click();

    await page.getByLabel('Name').fill('My Test Workspace');

    const slugInput = page.getByLabel('Slug');
    await expect(slugInput).toHaveValue('my-test-workspace');
  });

  test('should close dialog on cancel', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Workspace' }).click();

    await expect(page.getByRole('heading', { name: 'Create Workspace' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('heading', { name: 'Create Workspace' })).not.toBeVisible();
  });

  test('should display workspace cards', async ({ page }) => {
    // Assumes at least one workspace exists
    await expect(page.locator('[data-testid="workspace-card"]').first()).toBeVisible();
  });

  test('should navigate to workspace on click', async ({ page }) => {
    // Assumes at least one workspace exists
    const firstWorkspace = page.locator('[data-testid="workspace-card"]').first();
    await firstWorkspace.click();

    await expect(page).toHaveURL(/\/workspaces\/[a-z0-9-]+/);
  });
});
