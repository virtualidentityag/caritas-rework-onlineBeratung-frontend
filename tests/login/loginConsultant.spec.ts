import { expect, test } from '@playwright/test';
import { loginUser } from '../helpers/loginUser';

// specific login tests are not test cases but good-to-have tests (in progress)
test.fixme('Log in as a consultant', async ({ page }) => {
	const username = process.env.TEST_CONSULTANT;
	const password = process.env.TEST_PASSWORD;

	await loginUser(page, username!, password!);

	// assert consultant is logged in
	await expect(page.locator('a[href="/profile"]')).toBeVisible();
	await expect(page.locator('div[id="local-switch-wrapper"]')).toBeVisible();

	// log out & assert home page
	await page
		.locator(
			'div.navigation__item__bottom div.navigation__item:last-of-type'
		)
		.click();
	await page.waitForSelector('h1.headline--1');
	await expect(page.locator('h1.headline--1')).toBeVisible();
	await expect(page.locator('h4.headline--4')).toBeVisible();
});
