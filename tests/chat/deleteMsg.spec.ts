import { expect, test } from '@playwright/test';
import { loginUser } from '../helpers/loginUser';
import { goToSessions } from '../utils';

test('delete a msg', async ({ page }) => {
	const username = process.env.TEST_USERNAME;
	const password = process.env.TEST_PASSWORD;
	const temporaryMsg = 'This is a test message soon to be deleted.';

	await loginUser(page, username!, password!);
	goToSessions(page);

	await page.getByRole('combobox').fill(temporaryMsg);
	await page.locator('rect').click();

	// wait for the message to appear in chat
	const lastChat = page
		.locator('.messageItem__messageWrap.messageItem__messageWrap--right')
		.last();
	await expect(lastChat).toContainText(temporaryMsg);

	// open the message menu and delete the message
	await lastChat.locator('.flyoutMenu__trigger').click();
	const deleteButton = page.locator(
		'.flyoutMenu__content--shown .flyoutMenu__item--delete'
	);
	await expect(deleteButton).toBeVisible();
	await deleteButton.click();

	await page.locator('button.button__item.button__primary').click();

	// assert that the message is deleted
	const deletedMessage = lastChat.locator('.messageItem__message--deleted');
	await expect(deletedMessage).toBeVisible();
});
