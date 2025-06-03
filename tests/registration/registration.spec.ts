import { test } from '@playwright/test';
import { registerUser } from '../helpers/registerUser';

test('Register a new user (advice seeker)', async ({ page }) => {
	await registerUser(page);
});
