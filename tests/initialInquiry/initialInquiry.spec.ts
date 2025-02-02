import { expect, test } from '@playwright/test';
import { registerUser } from '../helpers/registerUser';
import { loginUser } from '../helpers/loginUser';

test.describe.serial('Run tests in sequence', () => {
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

		// assert further steps info
		await expect(page.locator('div.e2eeActivatedMessage')).toBeVisible();
		await expect(page.locator('div.furtherSteps')).toBeVisible();
		await expect(page.locator('ul.furtherSteps__steps')).toBeVisible();
		await expect(
			page.locator('p.furtherSteps__infoText').first()
		).toBeVisible();

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

		// assert user is logged in and check for initial inquiries
		await page.waitForSelector('a[href="/profile"]');
		await expect(page.locator('a[href="/profile"]')).toBeVisible();
		await expect(
			page.locator('div[id="local-switch-wrapper"]')
		).toBeVisible();

		await page.locator('a.navigation__item:first-of-type').click();

		const sessionItems = page.locator('div.sessionsListItem');

		if ((await sessionItems.count()) > 0) {
			await sessionItems.last().click();

			const acceptRequestButton = page.locator(
				'div.session__acceptance button.button__primary'
			);
			await expect(acceptRequestButton).toBeVisible();
			await acceptRequestButton.click();
			await page.waitForSelector('div.overlay');
			await page.locator(
				'div.overlay button.button__item.button__primary'
			);
		} else {
			throw new Error('No initial messages found for this consultant!');
		}
	});
});
