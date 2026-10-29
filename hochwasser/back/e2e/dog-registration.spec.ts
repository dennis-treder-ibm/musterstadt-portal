import { test, expect } from '@playwright/test';
import { loginAsCitizen } from './helpers/auth';

test.describe('Hundeanmeldung Form (dogRegistration.xhtml)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCitizen(page);
    await page.goto('dog/dogRegistration.xhtml');
  });

  test('should validate dog name is required', async ({ page }) => {
    await page.locator('#dogForm\\:dogName').fill('');
    await page.locator('input[value="Hund anmelden"]').click();

    await expect(page.locator('#mainLayout')).toContainText('Hundename darf nicht leer sein.');
  });

  test('should register a dog successfully and display in table', async ({ page }) => {
    const timestamp = Date.now().toString().slice(-4);
    const dogName = `Bello_${timestamp}`;

    await page.locator('#dogForm\\:dogName').fill(dogName);
    await page.locator('#dogForm\\:breed').fill('Golden Retriever');
    await page.locator('#dogForm\\:chipNumber').fill('276098104567891');
    await page.locator('input[value="Hund anmelden"]').click();

    await expect(page.locator('#mainLayout')).toContainText('Hund erfolgreich angemeldet. Registrierungsnummer:');
    await expect(page.locator('#dogTableForm')).toContainText(dogName);
  });

  test('should filter dogs by search query and reset search', async ({ page }) => {
    await page.locator('#searchForm\\:searchQuery').fill('Rex');
    await page.locator('input[value="Suchen"]').click();

    await expect(page.locator('#dogTableForm')).toContainText('Rex');

    await page.locator('input[value="Zurücksetzen"]').click();
    await expect(page.locator('#searchForm\\:searchQuery')).toHaveValue('');
  });
});
