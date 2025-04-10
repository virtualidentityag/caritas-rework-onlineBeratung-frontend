import { expect, BrowserContext, Page, Browser } from '@playwright/test';
import { loginUser } from './loginUser';
import { generateRandomAlphanumeric } from '../utils';

export async function registerByLink(browser: Browser, linkSelector: string) {
	const context: BrowserContext = await browser.newContext({
		permissions: ['clipboard-read', 'clipboard-write']
	});

	const page: Page = await context.newPage();
	const username = process.env.TEST_CONSULTANT;
	const password = process.env.TEST_PASSWORD;

	await loginUser(page, username!, password!);

	// navigate to profile and click the given registration link
	await (
		await page.waitForSelector('a[href="/profile"]', { state: 'visible' })
	).click();
	await page.locator(linkSelector).click();
	await page.waitForTimeout(500);

	// read the copied link from the clipboard
	const copiedLink = await page.evaluate(async () => {
		try {
			return await navigator.clipboard.readText();
		} catch (error) {
			console.error('Error reading clipboard:', error);
			return '';
		}
	});

	expect(copiedLink).not.toBe('');

	// open the copied link in a new page and register
	const nextPage = await browser.newPage();
	await nextPage.goto(copiedLink);

	await (
		await nextPage.waitForSelector('a[data-cy="button-register"]')
	).click();
	await nextPage
		.locator("div[data-cy='topic-radio-group'] label")
		.first()
		.click();
	await nextPage.click('label[data-cy="topic-selection-radio-1"]');
	await nextPage.click('button[data-cy="button-next"]');
	await nextPage.fill('input[data-cy="input-postal-code"]', '99999');
	await nextPage.click('button[data-cy="button-next"]');

	const randomUsername = `testuser-${generateRandomAlphanumeric(4)}`;

	await nextPage
		.getByLabel(/(user\s?name|benutzername)/i)
		.fill(randomUsername);
	await nextPage
		.getByLabel(/pass\s?(word|wort)/i, { exact: true })
		.first()
		.fill(password!);
	await nextPage
		.getByLabel(/(passwort\s?wiederholen|repeat\s?password)/i)
		.fill(password!);

	await nextPage.locator('input.PrivateSwitchBase-input').click();
	await nextPage.click('button[data-cy="button-register"]');
	await nextPage.locator('button.button__autoClose').click();

	// close context and browser
	await nextPage.close();
	await context.close();
	await browser.close();
}
