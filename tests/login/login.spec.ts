import { expect, test } from '@playwright/test';
import { goToPage } from '../utils';

test('User login', async ({ page }) => {
	const username = process.env.TEST_USERNAME;
	const password = process.env.TEST_PASSWORD;
	const loginButton = page.locator('button.button__item.button__primary');

	await goToPage(page, 'login');
	await page.fill('input[id="username"]', username!);
	await page.fill('input[id="passwordInput"]', password!);
	await loginButton.click();
	await page.locator('.sessionsList__illustration__image').click();
	await expect(page.locator('a[href="/profile"]')).toBeVisible();
	await expect(page.locator('div[id="local-switch-wrapper"]')).toBeVisible();
	await page
		.locator('svg[aria-label="Log out"]')
		.nth(0)
		.click({ force: true });
	await expect(page.locator('h1.headline--1')).toBeVisible();
	await expect(page.locator('h4.headline--4')).toBeVisible();
});
