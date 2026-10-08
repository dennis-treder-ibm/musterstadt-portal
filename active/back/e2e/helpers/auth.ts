import { Page, expect } from '@playwright/test';

export async function loginAsCitizen(page: Page) {
  await page.goto('login.xhtml');
  await page.locator('#loginForm\\:username').fill('buerger');
  await page.locator('#loginForm\\:password').fill('demo-password');
  await page.locator('input[type="submit"]').click();
  await expect(page).toHaveURL(/.*(dashboard|login)\.xhtml/);
}
