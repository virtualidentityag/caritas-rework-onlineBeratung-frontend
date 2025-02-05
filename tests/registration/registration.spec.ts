import { test } from '@playwright/test';
import { registerUser } from '../helpers/registerUser';

// registration is skipped until a delete-user function is implemented
test.skip('Register a new user (advice seeker)', async ({ page }) => {
	await registerUser(page);
});
