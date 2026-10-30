import { test, expect } from '@playwright/test';
import { loginAsCitizen } from './helpers/auth';

test.describe('Parkausweis Form (parkingPermit.xhtml)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCitizen(page);
    await page.goto('parking/parkingPermit.xhtml');
  });

  test('should validate vehicle registration minimum length', async ({ page }) => {
    await page.locator('#parkingForm\\:vehicleRegistration').fill('M-A');
    await page.locator('input[value="Antrag einreichen"]').click();

    await expect(page.locator('#mainLayout')).toContainText('Fahrzeugkennzeichen muss mindestens 5 Zeichen lang sein.');
  });

  test('should validate zone selection', async ({ page }) => {
    await page.locator('#parkingForm\\:vehicleRegistration').fill('M-AB 1234');
    await page.locator('#parkingForm\\:zone').selectOption('');
    await page.locator('input[value="Antrag einreichen"]').click();

    await expect(page.locator('#mainLayout')).toContainText('Bitte wählen Sie eine Parkzone aus.');
  });

  test('should submit parking permit application successfully', async ({ page }) => {
    const timestamp = Date.now().toString().slice(-4);
    const licensePlate = `M-PW ${timestamp}`;

    await page.locator('#parkingForm\\:vehicleRegistration').fill(licensePlate);
    await page.locator('#parkingForm\\:zone').selectOption('Zone B');
    await page.locator('#parkingForm\\:proofDocumentPath').fill('/uploads/nachweis-auto.pdf');
    await page.locator('input[value="Antrag einreichen"]').click();

    await expect(page.locator('#mainLayout')).toContainText('Ihr Parkausweis-Antrag wurde erfolgreich eingereicht. Antragsnummer:');
  });
});
