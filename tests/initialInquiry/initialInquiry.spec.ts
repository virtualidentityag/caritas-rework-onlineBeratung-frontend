import { expect, test } from '@playwright/test';
import { registerUser } from '../helpers/registerUser';
import { loginUser } from '../helpers/loginUser';

test.describe.serial('Create initial inquiry', () => {
	test('Send initial msg request', async ({ page }) => {
		await registerUser(page);

		// select counseling language (if available)
		if (await page.locator('div.enquiryLanguageSelection').isVisible()) {
			await handleLanguageTabs(page);
		}

		async function handleLanguageTabs(page: any) {
			const languageTabs = page.locator(
				'span.enquiryLanguageSelection__tab'
			);
			const count = await languageTabs.count();

			if (count > 1) {
				await languageTabs.nth(count - 1).click();
			} else if (count === 1) {
				await expect(languageTabs.first()).toBeVisible();
			} else {
				throw new Error('No counseling language found!');
			}
		}

		// assert welcome msg & img
		await expect(page.locator('div.enquiry__text')).toBeVisible();
		await expect(
			page.locator('h3.enquiry__infotextHeadline')
		).toBeVisible();
		await expect(page.locator('p.enquiry__facts')).toBeVisible();
		await expect(page.locator('svg.enquiry__image')).toBeVisible();

		// write message
		await page.getByRole('combobox').fill('Hello there, I need help!');
		await page.locator('rect').click();
		await page.locator('button.button__autoClose').click();

		// assert further steps info & msg
		await expect(page.locator('div.e2eeActivatedMessage')).toBeVisible();
		await expect(page.locator('div.furtherSteps')).toBeVisible();
		await expect(page.locator('ul.furtherSteps__steps')).toBeVisible();
		await expect(
			page.locator('p.furtherSteps__infoText').first()
		).toBeVisible();

		const messageText = await page.locator(
			'.messageItem__message.messageItem__message--myMessage p'
		);
		await expect(messageText).toBeVisible();
		await expect(messageText).not.toBeEmpty();

		// logout
		await page
			.locator(
				'div.navigation__item__bottom div.navigation__item:last-of-type'
			)
			.click();
	});

	test('Respond initial msg (as a consultant)', async ({ page }) => {
		const username = process.env.TEST_CONSULTANT;
		const password = process.env.TEST_PASSWORD;

		await loginUser(page, username!, password!);

		await page.waitForSelector('a[href="/profile"]', { state: 'visible' });
		await expect(
			page.locator('div[id="local-switch-wrapper"]')
		).toBeVisible();
		await page.locator('a.navigation__item:first-of-type').click();
		await page.waitForSelector('.listInfo__illustration');
		await page.waitForSelector('div[data-cy="session-list-item"]');

		const sessionItems = await page.locator(
			'div[data-cy="session-list-item"]'
		);

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
});
