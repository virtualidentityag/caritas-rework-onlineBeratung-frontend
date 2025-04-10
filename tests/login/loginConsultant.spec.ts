import { expect, test } from '@playwright/test';
import { loginUser } from '../helpers/loginUser';
import { logout } from '../utils';

test('Log in as a consultant', async ({ page }) => {
	const username = process.env.TEST_CONSULTANT;
	const password = process.env.TEST_PASSWORD;

	await loginUser(page, username!, password!);

	await page.waitForSelector('a[href="/profile"]', { state: 'visible' });
	await expect(page.locator('div[id="local-switch-wrapper"]')).toBeVisible();

	// log out & assert home page
	await logout(page);
});
