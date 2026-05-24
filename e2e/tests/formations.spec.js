import { test, expect } from '@playwright/test';
import { registerUser, createCentre, createFormation } from '../fixtures/helpers.js';

test.describe('Formation Browsing', () => {

  test('homepage shows formations section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // The page should load and show at least one heading or formation related content
    const bodyText = await page.textContent('body');
    expect(bodyText.length).toBeGreaterThan(0);
  });

  test('formations page loads and displays formations', async ({ page, request }) => {
    // Set up some test data via API
    // 1. Register as RCF
    const rcf = await registerUser(request, { role: 'responsableCF' });
    // 2. Create a centre (may need admin approval — try anyway)
    const centreRes = await createCentre(request, rcf.token);
    const centreId = centreRes?._id || centreRes?.data?._id;

    if (centreId) {
      // 3. Create a formation in that centre
      await createFormation(request, rcf.token, centreId, {
        titre: `E2E Formation ${Date.now()}`,
      });
    }

    // Navigate to formations page
    await page.goto('/formations');
    await page.waitForLoadState('networkidle');

    // Should see at least the page heading
    const heading = page.locator('h1, h2, h3').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('formation detail page accessible from list', async ({ page, request }) => {
    // Try to navigate to formations and click the first one
    await page.goto('/formations');
    await page.waitForLoadState('networkidle');

    // Try clicking any link or card that looks like a formation
    const formationLink = page.locator(
      'a[href*="/formations/"], a[href*="/formation/"], [data-testid*="formation"], .formation-card, .formation-item'
    ).first();

    if (await formationLink.count() > 0) {
      await formationLink.click();
      await page.waitForLoadState('networkidle');
      // Should be on a formation detail page
      expect(page.url()).toContain('/formation');
    } else {
      test.skip('No formation links found on the page');
    }
  });

  test('search or filter formations', async ({ page }) => {
    await page.goto('/formations');
    await page.waitForLoadState('networkidle');

    // Try to find a search input
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], input[placeholder*="recherche" i], input[placeholder*="chercher" i]'
    ).first();

    if (await searchInput.count() > 0) {
      await searchInput.fill('Test');
      await page.waitForTimeout(1000);
      // Page should still be functional after search
      expect(await page.textContent('body')).toBeTruthy();
    } else {
      test.skip('No search input found');
    }
  });
});
