import { expect, Page } from '@playwright/test';

export async function ensureLanguage(page: Page) {
	let pageLang = (await page.getAttribute('html', 'lang')) || '';

	if (!['en', 'de'].includes(pageLang)) {
		await page.evaluate(() => {
			document.documentElement.lang = 'en';
		});
		pageLang = 'en';
	}

	expect(['en', 'de']).toContain(pageLang);
}

export function generateRandomAlphanumeric(length: number): string {
	const chars =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * chars.length);
		result += chars[randomIndex];
	}
	return result;
}

export async function goToSessions(page: Page) {
	await page.waitForSelector('a[href="/profile"]', { state: 'visible' });
	await expect(page.locator('div[id="local-switch-wrapper"]')).toBeVisible();
	await page.locator('a.navigation__item:first-of-type').click();

	await page.waitForSelector('div[data-cy="session-list-item"]');

	const sessionItems = await page.locator('div[data-cy="session-list-item"]');

	if ((await sessionItems.count()) > 0) {
		await sessionItems.first().click();
	} else {
		throw new Error('No sessions were found for this advice seeker!');
	}
}

export async function logout(page: Page) {
	await page
		.locator(
			'div.navigation__item__bottom div.navigation__item:last-of-type'
		)
		.click();
	await page.waitForSelector('h1.headline--1');
	await expect(page.locator('h1.headline--1')).toBeVisible();
	await expect(page.locator('h4.headline--4')).toBeVisible();
}
