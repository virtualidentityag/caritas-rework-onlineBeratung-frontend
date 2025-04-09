import { test } from '@playwright/test';
import { registerUser } from '../helpers/registerUser';

// registration tests are skipped until deletion script is implemented
test.skip('Register a new user (advice seeker)', async ({ page }) => {
	await registerUser(page);
});
