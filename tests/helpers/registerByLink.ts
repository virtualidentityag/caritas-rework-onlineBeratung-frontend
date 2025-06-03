import { expect, BrowserContext, Page, Browser } from '@playwright/test';
import { loginUser } from './loginUser';
import { generateRandomAlphanumeric } from '../utils';
import { logout } from '../utils';

export async function registerByLink(browser: Browser, linkSelector: string) {
	const context: BrowserContext = await browser.newContext({
		permissions: ['clipboard-read', 'clipboard-write']
	});

	const page: Page = await context.newPage();
	const username = process.env.TEST_CONSULTANT;
	const password = process.env.TEST_PASSWORD;

	await loginUser(page, username!, password!);

	// navigate to profile and click the given registration link
	await page.locator('a[href="/profile"]').click({ timeout: 30000 });
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

	await logout(page);

	await page.goto(copiedLink);

	await (await page.waitForSelector('a[data-cy="button-register"]')).click();
	await page
		.locator("div[data-cy='topic-radio-group'] label")
		.first()
		.click();
	await page.click('label[data-cy="topic-selection-radio-1"]');
	await page.click('button[data-cy="button-next"]');
	await page.fill('input[data-cy="input-postal-code"]', '99999');
	await page.click('button[data-cy="button-next"]');

	const randomUsername = `testuser-${generateRandomAlphanumeric(4)}`;

	await page.getByLabel(/(user\s?name|benutzername)/i).fill(randomUsername);
	await page
		.getByLabel(/pass\s?(word|wort)/i, { exact: true })
		.first()
		.fill(password!);
	await page
		.getByLabel(/(passwort\s?wiederholen|repeat\s?password)/i)
		.fill(password!);

	await page.locator('input.PrivateSwitchBase-input').click();
	await page.click('button[data-cy="button-register"]');
	await page.locator('button.button__autoClose').click();

	// close context and browser
	await page.close();
	await context.close();
}
