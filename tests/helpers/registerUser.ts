import { expect, Page } from '@playwright/test';
import { goToPage } from '../helpers/goToPage';
import { generateRandomAlphanumeric } from '../utils';

export async function registerUser(page: Page) {
	const password = process.env.TEST_PASSWORD;

	// go to the registration page
	await goToPage(page, 'registration');
	await expect(page.locator('h1.headline--1')).toBeVisible();
	await expect(page.locator('h4.headline--4')).toBeVisible();

	// start registration
	await page.click('a[data-cy="button-register"]');
	await page.click('div[id="panel-Children, teenagers, adults and family"]');
	await page.click('label[data-cy="topic-selection-radio-1"]');
	await page.click('button[data-cy="button-next"]');
	await page.fill('input[data-cy="input-postal-code"]', '99999');
	await page.click('button[data-cy="button-next"]');

	// select agency
	try {
		await page.getByText('TestAgencyA').click();
	} catch (error) {
		await page
			.locator('input[name="agency-selection-radio-group"]')
			.first()
			.click();
	}
	await page.click('button[data-cy="button-next"]');

	const randomUsername = `testuser_${generateRandomAlphanumeric(4)}`;

	// fill in the username & password (to-do: replace getByLabel with locator by id when delete func. is done)
	await page.getByLabel(/(user\s?name|benutzername)/i).fill(randomUsername);
	await page
		.getByLabel(/pass\s?(word|wort)/i, { exact: true })
		.first()
		.fill(password!);
	await page
		.getByLabel(/(passwort\s?wiederholen|repeat\s?password)/i)
		.fill(password!);

	// finish registration
	await page.locator('input.PrivateSwitchBase-input').click();
	await page.click('button[data-cy="button-register"]');
	await page.locator('button.button__autoClose').click();
}
