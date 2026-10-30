import { test, expect } from '@playwright/test';
import { loginAsCitizen } from './helpers/auth';

test.describe('Hochwasserhilfe Form', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCitizen(page);
    await page.goto('flood');
  });

  test('should show validation errors when required fields are empty', async ({ page }) => {
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#damageDescription')).toBeVisible();
    const notification = page.locator('.cds--inline-notification--error, [data-notification-type="error"]');
    await expect(notification).toContainText('Pflichtfeld');
  });

  test('should submit flood assistance application successfully', async ({ page }) => {
    const timestamp = Date.now().toString().slice(-4);

    await page.locator('#damageDescription').fill(`Keller vollständig überflutet, Schäden an Möbeln und Heizungsanlage. (Test-${timestamp})`);
    await page.locator('#affectedStreet').fill('Hauptstraße 12');
    await page.locator('#postcode').fill('80331');
    await page.locator('#severityLevel').selectOption('MITTEL');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.cds--inline-notification--success, [data-notification-type="success"]'))
      .toContainText('erfolgreich eingereicht');
  });

  test('should display submitted application in the applications table', async ({ page }) => {
    const timestamp = Date.now().toString().slice(-4);
    const street = `Teststraße_${timestamp}`;

    await page.locator('#damageDescription').fill(`Erdgeschoss überschwemmt. (Test-${timestamp})`);
    await page.locator('#affectedStreet').fill(street);
    await page.locator('#postcode').fill('80331');
    await page.locator('#severityLevel').selectOption('SCHWER');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.cds--inline-notification--success, [data-notification-type="success"]'))
      .toContainText('erfolgreich eingereicht');

    await expect(page.locator('.cds--data-table')).toContainText(street);
  });
});
