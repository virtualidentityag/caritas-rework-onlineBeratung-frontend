import { test, expect } from '@playwright/test';
import { loginUser } from '../helpers/loginUser';

test('dearchive a consultation by clicking the archive menu option', async ({
	page
}) => {
	const username = process.env.TEST_CONSULTANT;
	const password = process.env.TEST_PASSWORD;

	await loginUser(page, username!, password!);
	await page.waitForSelector('a[href="/profile"]', { state: 'visible' });
	await expect(page.locator('div[id="local-switch-wrapper"]')).toBeVisible();
	await page.click('a[href="/sessions/consultant/sessionView"]');

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
	let archivedUsername = '';

	if ((await archivedSessionItems.count()) > 0) {
		const firstArchivedSession = archivedSessionItems.first();
		archivedUsername = await firstArchivedSession
			.locator('div.sessionsListItem__username')
			.innerText();
		await firstArchivedSession.click();
	} else {
		throw new Error('No archived sessions were found');
	}

	// dearchive a chat
	await page
		.locator('div.sessionMenu__wrapper span#iconH')
		.click({ timeout: 5000 });
	await page
		.locator('div.sessionMenu__item')
		.filter({ hasText: /dearchive|dearchivieren/i })
		.click();

	// check if dearchived chat is now in current chat sessions
	await page.click('a[href="/sessions/consultant/sessionView"]');
	await page.waitForSelector('div[data-cy="session-list-item"]');
	const sessionItems = page.locator('div[data-cy="session-list-item"]');
	const sessionsCount = await sessionItems.count();

	let foundMatch = false;

	for (let i = 0; i < sessionsCount; i++) {
		const sessionItem = sessionItems.nth(i);
		const dearchivedUsername = await sessionItem
			.locator('div.sessionsListItem__username')
			.innerText();

		if (dearchivedUsername.trim() === archivedUsername.trim()) {
			console.log('Matched archived session username:', archivedUsername);
			await sessionItem.click();
			foundMatch = true;
			break;
		}
	}

	if (!foundMatch) {
		throw new Error(
			`Archived session with username "${archivedUsername}" not found.`
		);
	}
});

test('dearchive a consultation by messaging', async ({ page }) => {
	const username = process.env.TEST_CONSULTANT;
	const password = process.env.TEST_PASSWORD;

	await loginUser(page, username!, password!);
	await page.waitForSelector('a[href="/profile"]', { state: 'visible' });
	await expect(page.locator('div[id="local-switch-wrapper"]')).toBeVisible();
	await page.click('a[href="/sessions/consultant/sessionView"]');
});
