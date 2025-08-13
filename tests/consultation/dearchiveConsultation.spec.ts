import { test, expect, Page } from '@playwright/test';
import { loginUser } from '../helpers/loginUser';
import { ensureLanguage } from '../utils';

const loginOpenArchived = async (page: Page) => {
	await loginUser(
		page,
		process.env.TEST_CONSULTANT!,
		process.env.TEST_PASSWORD!
	);
	ensureLanguage(page);
	await page.waitForSelector('a[href="/profile"]', { state: 'visible' });
	await expect(page.locator('#local-switch-wrapper')).toBeVisible();
	await page.click('a[href="/sessions/consultant/sessionView"]');
	await page.click('a[href*="sessionListTab=archive"]');
	await page.waitForSelector('div[data-cy="session-list-item"]', {
		timeout: 10000
	});
	const archived = page.locator('div[data-cy="session-list-item"]');
	if (!(await archived.count()))
		throw new Error('No archived sessions were found');
	await archived.first().click();
};

const assertCurrentHasChats = async (page: Page) => {
	await page.click('a[href="/sessions/consultant/sessionView"]');
	await page.waitForSelector('div[data-cy="session-list-item"]', {
		timeout: 10000
	});
	if (!(await page.locator('div[data-cy="session-list-item"]').count())) {
		throw new Error(
			'No chats found in the current sessions tab after dearchiving.'
		);
	}
};

test('dearchive a consultation by clicking the archive menu option', async ({
	page
}) => {
	await loginOpenArchived(page);
	await page
		.locator('div.sessionMenu__wrapper span#iconH')
		.click({ timeout: 5000 });
	await page
		.locator('div.sessionMenu__item')
		.filter({ hasText: /dearchive|dearchivieren/i })
		.click();
	await assertCurrentHasChats(page);
});

test.skip('dearchive a consultation by messaging', async ({ page }) => {
	await loginOpenArchived(page);
	await page
		.getByRole('combobox')
		.fill('This msg should unarchive this chat');
	await page.locator('rect').click();
	await assertCurrentHasChats(page);
});
