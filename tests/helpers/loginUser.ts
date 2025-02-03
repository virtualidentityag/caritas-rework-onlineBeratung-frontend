import { Page } from '@playwright/test';
import { goToPage } from '../helpers/goToPage';
import * as OTPAuth from 'otpauth';

export async function loginUser(
	page: Page,
	username: string,
	password: string
) {
	await goToPage(page, 'login');
	await page.fill('input[id="username"]', username!);
	await page.fill('input[id="passwordInput"]', password!);

	let totp = new OTPAuth.TOTP({
		issuer: 'ACME',
		label: 'MyTOTP',
		algorithm: 'SHA1',
		digits: 6,
		period: 30,
		secret: process.env.OTP_SECRET
	});

	const otpField = page.locator('input[id="otp"]');
	await otpField;

	// check if OTP input field exists and is visible
	if (await otpField.isVisible()) {
		let token = totp.generate();

		if (!token) {
			throw new Error('2FA code not found in email.');
		}
		// enter the 2FA code in the input field
		await otpField.fill(token);
	} else {
		console.log('Skipping 2FA entry.');
	}

	await page.locator('button.button__item.button__primary').click();
}
