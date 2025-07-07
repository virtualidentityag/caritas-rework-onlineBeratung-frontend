import { test, expect } from '@playwright/test';
import { loginUser } from '../helpers/loginUser';
import { ensureLanguage } from '../utils';

test('archive a consultation', async ({ page }) => {
	const username = process.env.TEST_CONSULTANT;
	const password = process.env.TEST_PASSWORD;
	ensureLanguage(page);

	await loginUser(page, username!, password!);
	await page.waitForSelector('a[href="/profile"]', { state: 'visible' });
	await expect(page.locator('div[id="local-switch-wrapper"]')).toBeVisible();

	await page.click('a[href="/sessions/consultant/sessionView"]');
	await page.waitForSelector('div[data-cy="session-list-item"]');
	const sessionItems = page.locator('div[data-cy="session-list-item"]');
	let firstUsername = '';

	if ((await sessionItems.count()) > 0) {
		const firstSession = sessionItems.first();
		firstUsername = await firstSession
			.locator('div.sessionsListItem__username')
			.innerText();
		await firstSession.click();
	} else {
		throw new Error('No sessions were found');
	}

	// go to session menu and click archive
	await page
		.locator('div.sessionMenu__wrapper span#iconH')
		.click({ timeout: 5000 });
	await page
		.locator('div.sessionMenu__item')
		.filter({ hasText: /archive|archivieren/i })
		.click();
	await page.waitForSelector('div.overlay');
	await page.locator('div.overlay button.button__autoClose').click();

	// go to archive tab
	await page.click(
		'a[href="/sessions/consultant/sessionView?sessionListTab=archive"]'
	);
	await page.waitForSelector('div[data-cy="session-list-item"]', {
		timeout: 10000
	});

	const archivedSessionItems = page.locator(
		'div[data-cy="session-list-item"]'
	);
	const archivedCount = await archivedSessionItems.count();

	let foundMatch = false;

	for (let i = 0; i < archivedCount; i++) {
		const archivedItem = archivedSessionItems.nth(i);
		const archivedUsername = await archivedItem
			.locator('div.sessionsListItem__username')
			.innerText();

		if (archivedUsername.trim() === firstUsername.trim()) {
			await archivedItem.click();
			foundMatch = true;
			break;
		}
	}

	if (!foundMatch) {
		throw new Error(
			`Archived session with username "${firstUsername}" not found.`
		);
	}
});
