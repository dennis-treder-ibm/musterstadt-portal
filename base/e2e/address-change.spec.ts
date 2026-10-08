import { test, expect } from '@playwright/test';
import { loginAsCitizen } from './helpers/auth';

test.describe('Adressänderung Form (addressChange.xhtml)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCitizen(page);
    await page.goto('address/addressChange.xhtml');
  });

  test('should validate street is required', async ({ page }) => {
    await page.locator('#addressForm\\:street').fill('');
    await page.locator('input[value="Änderung beantragen"]').click();

    await expect(page.locator('#mainLayout')).toContainText('Straße darf nicht leer sein.');
  });

  test('should validate postal code length (5 digits required)', async ({ page }) => {
    await page.locator('#addressForm\\:street').fill('Hauptstraße');
    await page.locator('#addressForm\\:houseNumber').fill('10');
    await page.locator('#addressForm\\:postcode').fill('1234');
    await page.locator('#addressForm\\:city').fill('Musterstadt');
    await page.locator('input[value="Änderung beantragen"]').click();

    await expect(page.locator('#mainLayout')).toContainText('Postleitzahl ungültig');
  });

  test('should submit address change application successfully', async ({ page }) => {
    await page.locator('#addressForm\\:street').fill('Goethestraße');
    await page.locator('#addressForm\\:houseNumber').fill('42');
    await page.locator('#addressForm\\:postcode').fill('80331');
    await page.locator('#addressForm\\:city').fill('Musterstadt');
    await page.locator('input[value="Änderung beantragen"]').click();

    await expect(page.locator('#mainLayout')).toContainText('Ihre Adressänderung wurde erfolgreich beantragt. Antragsnummer:');
  });
});
