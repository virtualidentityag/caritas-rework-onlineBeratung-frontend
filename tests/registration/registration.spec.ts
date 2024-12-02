import { test, expect } from '@playwright/test';
import { caritasRework } from '../config';
import { ensureLanguage, generateRandomAlphanumeric } from '../utils';

// checks if the page has the home titles
test('Check registration page elements', async ({ page }) => {
	await page.goto(`${caritasRework.dev}registration`);
	ensureLanguage(page);
	await expect(page.locator('h1.headline--1')).toBeVisible();
	await expect(page.locator('h4.headline--4')).toBeVisible();
});

// registration test is skipped until a delete user account feature is implemented
test.skip('Complete registration process', async ({ page }) => {
	const password = process.env.TEST_PASSWORD;
	await page.goto(`${caritasRework.dev}registration`);
	ensureLanguage(page);
	await page.click('a[data-cy="button-register"]');

	// registration form
	await page.click('div[id="panel-Children, teenagers, adults and family"]');
	await page.click('label[data-cy="topic-selection-radio-1"]');
	await page.click('button[data-cy="button-next"]');
	await page.fill('input[data-cy="input-postal-code"]', '99999');
	await page.click('button[data-cy="button-next"]');
	await page
		.locator('input[name="agency-selection-radio-group"]')
		.first()
		.click();
	await page.click('button[data-cy="button-next"]');

	// username & password
	const randomUsername = `testuser_${generateRandomAlphanumeric(3)}`;
	await page.getByLabel(/(user\s?name|benutzername)/i).fill(randomUsername);
	await page
		.getByLabel(/pass\s?(word|wort)/i, { exact: true })
		.first()
		.fill(password!);
	await page
		.getByLabel(/(passwort\s?wiederholen|repeat\s?password)/i)
		.fill(password!);
	await page
		.getByLabel(/Ich habe die Datenschutzerklä|I have the Privacy policy/)
		.check();
	await page.click('button[data-cy="button-register"]');
	await page
		.getByRole('button', { name: /Nachricht verfassen|Compose message/ })
		.click();
});
