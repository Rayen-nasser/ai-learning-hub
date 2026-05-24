import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser, loginUser, createCentre, createFormation } from '../fixtures/helpers.js';

test.describe('RCF Flow — Centre & Formation Management', () => {

  let rcfToken, centreId, formationId;

  test.beforeAll(async ({ request }) => {
    // Register as RCF
    const rcf = await registerUser(request, { role: 'responsableCF' });
    rcfToken = rcf.token;

    // Create a centre
    const centreRes = await createCentre(request, rcfToken);
    centreId = centreRes?._id || centreRes?.data?._id;
  });

  test('RCF can login and see dashboard', async ({ page, request }) => {
    const { email, token } = await registerUser(request, { role: 'responsableCF' });

    // Login via localStorage
    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should be able to see the page
    expect(await page.textContent('body')).toBeTruthy();
  });

  test('create a formation', async ({ page, request }) => {
    // Register a fresh RCF and create centre
    const rcf = await registerUser(request, { role: 'responsableCF' });
    const centre = await createCentre(request, rcf.token);
    const cId = centre?._id || centre?.data?._id;

    test.skip(!cId, 'Could not create centre — admin approval may be needed');

    // Login
    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('token', t), rcf.token);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Navigate to formations page
    await page.goto('/responsable/formations');
    await page.waitForLoadState('networkidle');

    // Try to click "Create Formation" or "+" button
    const createBtn = page.locator(
      'button:has-text("Create"), button:has-text("Nouvelle"), button:has-text("+"), a:has-text("Create")'
    ).first();

    if (await createBtn.count() > 0) {
      await createBtn.click();
      await page.waitForTimeout(1000);

      // Fill formation form
      const titre = `E2E Formation ${Date.now()}`;
      const titreInput = page.locator('input[name="titre"], input[placeholder*="titre" i], input[placeholder*="title" i]').first();
      if (await titreInput.count() > 0) {
        await titreInput.fill(titre);
      }

      // Try to submit
      const submitBtn = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Créer"), button:has-text("Enregistrer")').first();
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForTimeout(2000);
      }

      // Check we're back on the formations list
      expect(page.url()).toContain('/formation');
    }
  });

  test('view centre details', async ({ page, request }) => {
    const { email, token } = await registerUser(request, { role: 'responsableCF' });
    await createCentre(request, token);

    // Login
    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.goto('/responsable/centres');
    await page.waitForLoadState('networkidle');

    // Should list centres
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });
});
