import { test, expect } from '@playwright/test';
import { goToPage, generateRandomAlphanumeric } from '../utils';

// registration is skipped until a delete user function is implemented
test('User registration', async ({ page }) => {
	const password = process.env.TEST_PASSWORD;
	await goToPage(page, 'registration');
	await expect(page.locator('h1.headline--1')).toBeVisible();
	await expect(page.locator('h4.headline--4')).toBeVisible();
	await page.click('a[data-cy="button-register"]');

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

	const randomUsername = `testuser_${generateRandomAlphanumeric(3)}`;

	// to-do: replace getByLabel lines with locator by id when delete method is implemented
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
