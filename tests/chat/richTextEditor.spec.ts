import { expect, test } from '@playwright/test';
import { loginUser } from '../helpers/loginUser';
import { goToSessions } from '../utils';

test('Send message using the rich text editor', async ({ page }) => {
	const username = process.env.TEST_USERNAME;
	const password = process.env.TEST_PASSWORD;

	await loginUser(page, username!, password!);

	// check sessions
	goToSessions(page);

	// use rich text & send message
	await page.getByRole('combobox').fill('Hello there, I need help!');
	await page.getByRole('combobox').press('ControlOrMeta+a');

	const richText = page.locator('span.textarea__richtextToggle');

	await richText.click();
	await expect(richText).toHaveClass(/textarea__richtextToggle--active/);

	await page.locator('.textarea__toolbar.textarea__toolbar--active');

	const richTextButtons = page.locator('.textarea__toolbar__button');

	await richTextButtons.nth(0).click(); // bold
	await richTextButtons.nth(1).click(); // italic
	await richTextButtons.nth(2).click(); // create ul

	await page.locator('rect').click();

	// check the rich text features are present in last msg
	const lastChatMessage = page
		.locator('.messageItem__message.messageItem__message--myMessage')
		.last();
	const ulElement = lastChatMessage.locator('ul');

	await expect(ulElement.locator('em')).toBeVisible();
	await expect(ulElement.locator('strong')).toBeVisible();
});

test('Send emojis', async ({ page }) => {
	const username = process.env.TEST_USERNAME;
	const password = process.env.TEST_PASSWORD;

	await loginUser(page, username!, password!);

	goToSessions(page);

	// select random emoji
	await page.locator('.emoji__select').click();
	await expect(
		page.locator('button.emoji__selectButton--pressed')
	).toBeVisible();

	const emojiPopover = page.locator('.emoji__selectPopover');
	const emojiItems = emojiPopover.locator(
		'li.emoji__selectPopover__groupItem'
	);
	const count = await emojiItems.count();

	count > 0
		? await emojiItems.nth(Math.floor(Math.random() * count)).click()
		: (() => {
				throw new Error('No emojis found!');
			})();

	await page.locator('rect').click();

	const emojiRegex = /[\p{Emoji}]/u;

	// check emoji was sent
	const lastChatMessage = page
		.locator('.messageItem__message.messageItem__message--myMessage')
		.last();

	await expect(lastChatMessage).toContainText(emojiRegex);
});
