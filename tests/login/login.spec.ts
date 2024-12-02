import { expect, test } from '@playwright/test';
import { caritasRework } from '../config';
import { ensureLanguage } from '../utils';

test('Login as an advice seeker', async ({ page }) => {
	const username = process.env.TEST_USERNAME;
	const password = process.env.TEST_PASSWORD;
	await page.goto(`${caritasRework.dev}`);
	ensureLanguage(page);
	await page.fill('input[id="username"]', username!);
	await page.fill('input[id="passwordInput"]', password!);
	await page.click('button[id="login"]');
	await page.locator('.sessionsList__illustration__image').click();
	await expect(page.locator('a[href="/profile"]')).toBeVisible();
	await expect(page.locator('div[id="local-switch-wrapper"]')).toBeVisible();
	await page.click('div[id="logout"]');
});
