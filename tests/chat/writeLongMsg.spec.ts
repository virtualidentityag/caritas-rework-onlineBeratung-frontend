import { expect, test } from '@playwright/test';
import { loginUser } from '../helpers/loginUser';
import { goToSessions, generateRandomAlphanumeric } from '../utils';

test('write long message and scroll to bottom', async ({ page }) => {
	const username = process.env.TEST_USERNAME;
	const password = process.env.TEST_PASSWORD;

	await loginUser(page, username!, password!);
	goToSessions(page);

	// generate long text and send
	const longMessage = await generateRandomAlphanumeric(7500);
	await page.getByRole('combobox').fill(longMessage);
	await page.locator('rect').click();

	const lastChatMessage = page
		.locator('.messageItem__message.messageItem__message--myMessage')
		.last();
	await expect(lastChatMessage).toContainText(longMessage);

	// use scroll to bottom feature and check long message is sent
	const scrollButton = await page.locator('.session__scrollToBottom '); // leave classname w/ space

	if (await scrollButton.isVisible()) {
		await scrollButton.click();
		await page.waitForSelector('.session__scrollToBottom--disabled');
	} else {
		await page.evaluate(() => window.scrollTo(0, 0));
		await expect(scrollButton).toBeVisible({ timeout: 1000 });
		await scrollButton.click();
		await page.waitForSelector('.session__scrollToBottom--disabled');
	}
});
