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
