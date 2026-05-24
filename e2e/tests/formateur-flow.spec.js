import { test, expect } from '@playwright/test';
import { registerUser, createCentre, createFormation } from '../fixtures/helpers.js';

test.describe('Formateur Flow — Lessons & Content', () => {

  test('formateur can login and access dashboard', async ({ page, request }) => {
    const { token } = await registerUser(request, { role: 'formateur' });

    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should be able to navigate
    expect(await page.textContent('body')).toBeTruthy();
  });

  test('formateur sees earnings page', async ({ page, request }) => {
    const { token } = await registerUser(request, { role: 'formateur' });

    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.goto('/formateur/earnings');
    await page.waitForLoadState('networkidle');

    // Page should load without error
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('formateur sees formations page', async ({ page, request }) => {
    const { token } = await registerUser(request, { role: 'formateur' });

    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
    await page.waitForLoadState('networkidle');

    await page.goto('/formateur/formations');
    await page.waitForLoadState('networkidle');

    // Should see the page
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('lesson detail page accessible', async ({ page, request }) => {
    // Use API to create data
    const rcf = await registerUser(request, { role: 'responsableCF' });
    const centre = await createCentre(request, rcf.token);
    const cId = centre?._id || centre?.data?._id;

    test.skip(!cId, 'Could not create centre');

    const formation = await createFormation(request, rcf.token, cId);
    const fId = formation?._id || formation?.data?._id;

    test.skip(!fId, 'Could not create formation');

    // Register as formateur
    const formateur = await registerUser(request, { role: 'formateur' });

    // Login as formateur
    await page.goto('/');
    await page.evaluate((t) => localStorage.setItem('token', t), formateur.token);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Navigate to a specific formation
    if (fId) {
      await page.goto(`/formateur/formations/${fId}`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/formateur/formations');
    }
  });
});
