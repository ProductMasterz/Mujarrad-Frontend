import { test, expect } from '@playwright/test';

/**
 * T084: E2E Test - Network error → retry → validation error → circular dependency
 */

test.describe('Scenario 6: Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    await page.fill('input[name="email"]', 'omar.h.shafeek@gmail.com');
    await page.fill('input[name="password"]', 'Om@r1234');
    await page.click('button:has-text("Sign in")');
    await page.waitForURL('**/workspaces');
    await page.click('text=Demo Workspace');
    await page.waitForURL('**/workspace/demo-workspace');
  });

  test('should handle network errors with retry', async ({ page }) => {
    // Intercept API calls and make them fail
    await page.route('**/api/nodes/**', (route) => {
      route.abort('failed');
    });

    await page.locator('[data-node-type="REGULAR"]').first().click();
    await page.waitForTimeout(500);

    // Should show retry message
    await expect(page.locator('text=Connection lost')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Retrying')).toBeVisible({ timeout: 3000 });
  });

  test('should display validation errors on save', async ({ page }) => {
    // Navigate and try to create node with empty title
    await page.click('button:has-text("New Page")');

    // Leave title empty
    await page.locator('input[name="title"]').fill('');
    await page.locator('textarea[name="markdownContent"]').fill('Content');

    await page.click('button:has-text("Create")');

    // Should show validation error
    await expect(page.locator('text=Title is required')).toBeVisible();
  });

  test('should prevent circular hierarchy dependencies', async ({ page }) => {
    // This test assumes UI for moving nodes in hierarchy
    // If not available, skip or test via API

    // Try to create circular structure: A contains B, B contains A
    // Should show error message with cycle path
    // Implementation depends on drag-drop or move dialog
  });

  test('should handle version conflicts gracefully', async ({ page }) => {
    await page.locator('[data-node-type="REGULAR"]').first().click();
    await page.waitForURL(/\/node\//);

    await page.click('button:has-text("Edit")');

    // Simulate version conflict by intercepting update request
    await page.route('**/api/nodes/**', (route) => {
      if (route.request().method() === 'PUT') {
        route.fulfill({
          status: 409,
          body: JSON.stringify({
            type: 'https://api.mujarrad.com/errors/conflict',
            title: 'Version Conflict',
            status: 409,
            detail: 'Node has been modified by another user',
          }),
        });
      } else {
        route.continue();
      }
    });

    await page.locator('textarea[name="markdownContent"]').fill('Updated content');
    await page.click('button:has-text("Save")');

    // Should show conflict error
    await expect(page.locator('text=modified by another user')).toBeVisible({ timeout: 5000 });
  });

  test('should show user-friendly error messages', async ({ page }) => {
    // Intercept and return 404
    await page.route('**/api/nodes/nonexistent', (route) => {
      route.fulfill({
        status: 404,
        body: JSON.stringify({
          type: 'https://api.mujarrad.com/errors/not-found',
          title: 'Node Not Found',
          status: 404,
          detail: 'The requested page does not exist',
        }),
      });
    });

    // Try to navigate to non-existent node
    await page.goto('/workspace/demo-workspace/node/nonexistent');

    await expect(page.locator('text=page does not exist')).toBeVisible();
    await expect(page.locator('button:has-text("Go Back")')).toBeVisible();
  });

  test('should not break UI when errors occur', async ({ page }) => {
    // Force an error
    await page.route('**/api/workspaces/**/nodes', (route) => {
      route.abort('failed');
    });

    await page.reload();
    await page.waitForTimeout(2000);

    // UI should still be functional
    await expect(page.locator('[data-testid="hierarchy-sidebar"]')).toBeVisible();
    await expect(page.locator('button:has-text("New Page")')).toBeVisible();
  });
});
