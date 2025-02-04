import { expect, test } from '@playwright/test';
import { loginUser } from '../helpers/loginUser';

test('Respond initial msg (as a consultant)', async ({ page }) => {
	const username = process.env.TEST_CONSULTANT;
	const password = process.env.TEST_PASSWORD;

	await loginUser(page, username!, password!);

	// await page.waitForLoadState('networkidle');
	await page.waitForSelector('a[href="/profile"]', { state: 'visible' });
	await expect(page.locator('div[id="local-switch-wrapper"]')).toBeVisible();
	await page.locator('a.navigation__item:first-of-type').click();
	await page.waitForSelector('.listInfo__illustration');
	await page.waitForSelector('div[data-cy="session-list-item"]');

	const sessionItems = await page.locator('div[data-cy="session-list-item"]');

	if ((await sessionItems.count()) > 0) {
		await sessionItems.last().click();

		const acceptRequestButton = page.locator(
			'div.session__acceptance button.button__primary'
		);
		await expect(acceptRequestButton).toBeVisible();
		await acceptRequestButton.click();
		await page.waitForSelector('div.overlay');
		await page
			.locator('div.overlay button.button__item.button__primary')
			.click();
	} else {
		throw new Error('No initial messages found for this consultant!');
	}
});
