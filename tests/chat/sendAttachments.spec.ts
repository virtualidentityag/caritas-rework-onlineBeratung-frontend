import { expect, test } from '@playwright/test';
import { loginUser } from '../helpers/loginUser';
import { goToSessions } from '../utils';

test('attach a file to a msg and send it', async ({ page }) => {
	await loginUser(
		page,
		process.env.TEST_USERNAME!,
		process.env.TEST_PASSWORD!
	);
	goToSessions(page);

	const [fileChooser] = await Promise.all([
		page.waitForEvent('filechooser'),
		page.locator('span.textarea__attachmentSelect').click()
	]);

	// load a file (img or pdf)
	const fileName = 'img1mb.png';
	await fileChooser.setFiles(`tests/files/${fileName}`);
	await page.locator('.textarea__buttons rect').click();

	await page.waitForFunction(() => {
		const progressBar = document.querySelector(
			'.textarea__attachmentSelected__progress'
		);
		return (
			progressBar instanceof HTMLElement &&
			progressBar.style.width === '100%'
		);
	});

	// confirm attachment is sent
	const lastChat = page
		.locator('.messageItem__message__attachment__title')
		.last();
	await expect(lastChat).toContainText(fileName);
});
