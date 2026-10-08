import { test, expect } from '@playwright/test';

test.describe('Anmeldung Form (login.xhtml)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('login.xhtml');
  });

  test('should display login form fields', async ({ page }) => {
    await expect(page.locator('#loginForm\\:username')).toBeVisible();
    await expect(page.locator('#loginForm\\:password')).toBeVisible();
    await expect(page.locator('input[type="submit"]')).toBeVisible();
  });

  test('should show error message on invalid credentials', async ({ page }) => {
    await page.locator('#loginForm\\:username').fill('wronguser');
    await page.locator('#loginForm\\:password').fill('wrongpass');
    await page.locator('input[type="submit"]').click();

    await expect(page.locator('#loginBox')).toContainText('Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
  });

  test('should successfully log in with valid credentials and navigate to dashboard', async ({ page }) => {
    await page.locator('#loginForm\\:username').fill('buerger');
    await page.locator('#loginForm\\:password').fill('demo-password');
    await page.locator('input[type="submit"]').click();

    await expect(page).toHaveTitle(/.*Startseite/);
    await expect(page.locator('#mainLayout')).toContainText('Willkommen im Bürgerportal Musterstadt');
    await expect(page.locator('#headerForm')).toContainText('Angemeldet als: buerger');
  });
});
