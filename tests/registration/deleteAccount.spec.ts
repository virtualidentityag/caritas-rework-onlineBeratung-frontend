import { test } from '@playwright/test';
import { registerUser } from '../helpers/registerUser';
import { setTimeout } from 'timers/promises';

test('delete account as an advice seeker', async ({ page }) => {
	const password = process.env.TEST_PASSWORD;
	await registerUser(page);

	await page.locator('a[href="/profile"]').click({ timeout: 5000 });
	await page.locator('a[href="/profile/einstellungen"]').click();

	await page.locator('.deleteAccount button').click();
	await page.waitForSelector('.deleteAccount__overlay', { state: 'visible' });

	await page.fill('input[id="passwordInput"]', password!);
	setTimeout(60000);
	await page
		.locator('button.button__item.button__primary')
		.click({ timeout: 5000 });
});
