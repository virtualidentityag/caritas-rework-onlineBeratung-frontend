import { test } from '@playwright/test';
import { registerByLink } from '../helpers/registerByLink';

test('Registration via consultant link', async ({ browser }) => {
	await registerByLink(browser, '.profile__data__copy_registration_link');
});
