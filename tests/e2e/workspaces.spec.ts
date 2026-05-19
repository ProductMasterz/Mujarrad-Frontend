import { test, expect } from '@playwright/test';

test.describe('Space Management', () => {
  test.beforeEach(async ({ page }) => {
    // Note: In real tests, you'd need to login first
    // This assumes you have a test user or mock auth
    await page.goto('/spaces');
  });

  test('should display spaces page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /spaces/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Space' })).toBeVisible();
  });

  test('should open create space dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Space' }).click();

    await expect(page.getByRole('heading', { name: 'Create Space' })).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Slug')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
  });

  test('should validate space form', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Space' }).click();
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(/name is required/i)).toBeVisible();
    await expect(page.getByText(/slug must be at least/i)).toBeVisible();
  });

  test('should validate slug format', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Space' }).click();

    await page.getByLabel('Slug').fill('Invalid Slug!');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await expect(page.getByText(/lowercase letters.*numbers.*hyphens/i)).toBeVisible();
  });

  test('should display empty state when no spaces', async ({ page }) => {
    // Assumes no spaces exist
    await expect(page.getByText(/no spaces yet/i)).toBeVisible();
  });

  test('should auto-generate slug from name', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Space' }).click();

    await page.getByLabel('Name').fill('My Test Space');

    const slugInput = page.getByLabel('Slug');
    await expect(slugInput).toHaveValue('my-test-space');
  });

  test('should close dialog on cancel', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Space' }).click();

    await expect(page.getByRole('heading', { name: 'Create Space' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('heading', { name: 'Create Space' })).not.toBeVisible();
  });

  test('should display space cards', async ({ page }) => {
    // Assumes at least one space exists
    await expect(page.locator('[data-testid="space-card"]').first()).toBeVisible();
  });

  test('should navigate to space on click', async ({ page }) => {
    // Assumes at least one space exists
    const firstSpace = page.locator('[data-testid="space-card"]').first();
    await firstSpace.click();

    await expect(page).toHaveURL(/\/spaces\/[a-z0-9-]+/);
  });
});
