import { test, expect } from '@playwright/test';
import { loginUser } from '../helpers/loginUser';
import { ensureLanguage } from '../utils';

test('archive a consultation', async ({ page }) => {
	ensureLanguage(page);
	await loginUser(
		page,
		process.env.TEST_CONSULTANT!,
		process.env.TEST_PASSWORD!
	);
	await page.waitForSelector('a[href="/profile"]', { state: 'visible' });
	await expect(page.locator('div[id="local-switch-wrapper"]')).toBeVisible();

	await page.click('a[href="/sessions/consultant/sessionView"]');
	await page.waitForSelector('div[data-cy="session-list-item"]');

	const sessionItems = page.locator('div[data-cy="session-list-item"]');
	if ((await sessionItems.count()) === 0) {
		throw new Error('No sessions were found');
	}

	// pick the first session + capture username
	const firstSession = sessionItems.first();
	const firstUsername = (
		await firstSession.locator('div.sessionsListItem__username').innerText()
	).trim();
	await firstSession.click();

	// archive it
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

	// wait for this username to appear in the archive list
	await expect(
		page.locator('div.sessionsListItem__username', {
			hasText: firstUsername
		})
	).toBeVisible({ timeout: 10000 });
});
