import { test } from '@playwright/test';
import { caritasRework } from '../config';
import { ensureLanguage } from '../utils';

test('Login as an advice seeker', async ({ page }) => {
	const username = process.env.TEST_USERNAME;
	const password = process.env.TEST_PASSWORD;
	await page.goto(`${caritasRework.dev}`);
	ensureLanguage(page);
	await page.getByLabel(/(user\s?name|benutzername)/i).fill(username!);
	await page
		.getByLabel(/pass\s?(word|wort)/i)
		.first()
		.fill(password!);
	await page.getByRole('button', { name: /(einloggen|login)/i }).click();
	await page.locator('.sessionsList__illustration__image').click();
	await page
		.getByRole('tab', { name: /(profile\s?profile|profil\s?profil)/i })
		.click();
	await page
		.getByRole('tab', {
			name: /(abmelden\s?abmelden|log\s?out\s?log\s?out)/i
		})
		.click();
});
