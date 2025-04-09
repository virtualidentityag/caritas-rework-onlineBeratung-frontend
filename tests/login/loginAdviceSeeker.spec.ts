import { expect, test } from '@playwright/test';
import { loginUser } from '../helpers/loginUser';
import { logout } from '../utils';

test('Log in as an advice seeker', async ({ page }) => {
	const username = process.env.TEST_USERNAME;
	const password = process.env.TEST_PASSWORD;

	await loginUser(page, username!, password!);

	// assert advice seeker is logged in
	await page.locator('.sessionsList__illustration__image').click();
	await page.waitForSelector('a[href="/profile"]', { state: 'visible' });
	await expect(page.locator('div[id="local-switch-wrapper"]')).toBeVisible();

	// log out & assert home page
	await logout(page);
});
