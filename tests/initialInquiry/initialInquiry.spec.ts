import { expect, test } from '@playwright/test';
import { registerUser } from '../helpers/registerUser';

test('Send initial msg request', async ({ page }) => {
	await registerUser(page);

	// select counseling language (if available)
	if (await page.locator('div.enquiryLanguageSelection').isVisible()) {
		await handleLanguageTabs(page);
	}

	async function handleLanguageTabs(page: any) {
		const languageTabs = page.locator('span.enquiryLanguageSelection__tab');
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
	await expect(page.locator('h3.enquiry__infotextHeadline')).toBeVisible();
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
