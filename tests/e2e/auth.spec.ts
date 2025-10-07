import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect unauthenticated user to login', async ({ page }) => {
    await expect(page).toHaveURL('/login');
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText(/email/i)).toBeVisible();
    await expect(page.getByText(/password/i)).toBeVisible();
  });

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Create one' }).click();
    await expect(page).toHaveURL('/register');
  });

  test('should display registration form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Username').fill('testuser');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('weak');
    await page.getByLabel('Confirm Password').fill('weak');

    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByText(/uppercase/i)).toBeVisible();
  });

  test('should validate password confirmation match', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Password', { exact: true }).fill('Password123');
    await page.getByLabel('Confirm Password').fill('Different123');

    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByText(/passwords.*match/i)).toBeVisible();
  });

  test('should display forgot password link', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/forgot.*password/i)).toBeVisible();
  });

  test('should show loading state during login', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('Password123');

    const loginButton = page.getByRole('button', { name: 'Sign in' });
    await loginButton.click();

    // Button should be disabled during loading
    await expect(loginButton).toBeDisabled();
  });
});
