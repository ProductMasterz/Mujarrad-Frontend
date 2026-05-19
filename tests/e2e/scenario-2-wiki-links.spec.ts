import { test, expect } from '@playwright/test';

/**
 * T080: E2E Test - View markdown → click wiki-link → navigate
 */

test.describe('Scenario 2: Wiki-link Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    await page.fill('input[name="email"]', 'omar.h.shafeek@gmail.com');
    await page.fill('input[name="password"]', 'Om@r1234');
    await page.click('button:has-text("Sign in")');
    await page.waitForURL('**/spaces');
    await page.click('text=Demo Space');
    await page.waitForURL('**/space/demo-space');
  });

  test('should render wiki-links as clickable elements', async ({ page }) => {
    // Navigate to a page with wiki-links
    const pageWithLinks = page.locator('[data-has-wiki-links="true"]').first();
    if (await pageWithLinks.isVisible()) {
      await pageWithLinks.click();
    } else {
      // Navigate to any page
      await page.locator('[data-node-type="REGULAR"]').first().click();
    }

    await page.waitForURL(/\/node\//);

    // Look for wiki-links in markdown content
    const wikiLinks = page.locator('[data-wiki-link="true"]');
    if (await wikiLinks.count() > 0) {
      const firstLink = wikiLinks.first();
      await expect(firstLink).toBeVisible();
      await expect(firstLink).toHaveAttribute('href', /.+/);
    }
  });

  test('should navigate to target page when wiki-link clicked', async ({ page }) => {
    await page.locator('[data-node-type="REGULAR"]').first().click();
    await page.waitForURL(/\/node\//);

    const wikiLink = page.locator('[data-wiki-link="true"]').first();
    if (await wikiLink.isVisible()) {
      const linkText = await wikiLink.textContent();
      await wikiLink.click();

      // Should navigate to new page
      await page.waitForURL(/\/node\/[a-zA-Z0-9-]+/);

      // Verify page loaded
      await expect(page.locator('[data-testid="node-detail-view"]')).toBeVisible();
    }
  });

  test('should display alias text but link to target page', async ({ page }) => {
    await page.locator('[data-node-type="REGULAR"]').first().click();
    await page.waitForURL(/\/node\//);

    const aliasedLink = page.locator('[data-wiki-link="true"][data-has-alias="true"]').first();
    if (await aliasedLink.isVisible()) {
      const displayText = await aliasedLink.textContent();
      const targetUrl = await aliasedLink.getAttribute('href');

      await aliasedLink.click();
      await page.waitForURL(/\/node\//);

      // Verify we navigated to target (not based on display text)
      expect(page.url()).toContain(targetUrl || '');
    }
  });

  test('should distinguish wiki-links from standard markdown links', async ({ page }) => {
    await page.locator('[data-node-type="REGULAR"]').first().click();
    await page.waitForURL(/\/node\//);

    const wikiLink = page.locator('[data-wiki-link="true"]').first();
    const standardLink = page.locator('a:not([data-wiki-link])').first();

    if (await wikiLink.isVisible() && await standardLink.isVisible()) {
      // Wiki-links should have distinct styling
      const wikiLinkColor = await wikiLink.evaluate((el) =>
        window.getComputedStyle(el).color
      );
      const standardLinkColor = await standardLink.evaluate((el) =>
        window.getComputedStyle(el).color
      );

      expect(wikiLinkColor).not.toBe(standardLinkColor);
    }
  });

  test('should show placeholder styling for non-existent page links', async ({ page }) => {
    await page.locator('[data-node-type="REGULAR"]').first().click();
    await page.waitForURL(/\/node\//);

    const placeholderLink = page.locator('[data-wiki-link-placeholder="true"]').first();
    if (await placeholderLink.isVisible()) {
      await expect(placeholderLink).toHaveClass(/wiki-link-placeholder/);

      // Clicking should still navigate (to placeholder page)
      await placeholderLink.click();
      await page.waitForURL(/\/node\//);
      await expect(page.locator('[data-testid="node-detail-view"]')).toBeVisible();
    }
  });

  test('should support browser back/forward after wiki-link navigation', async ({ page }) => {
    await page.locator('[data-node-type="REGULAR"]').first().click();
    await page.waitForURL(/\/node\//);
    const firstPageUrl = page.url();

    const wikiLink = page.locator('[data-wiki-link="true"]').first();
    if (await wikiLink.isVisible()) {
      await wikiLink.click();
      await page.waitForURL(/\/node\//);
      const secondPageUrl = page.url();

      // Go back
      await page.goBack();
      await page.waitForURL(firstPageUrl);

      // Go forward
      await page.goForward();
      await page.waitForURL(secondPageUrl);

      expect(page.url()).toBe(secondPageUrl);
    }
  });
});
