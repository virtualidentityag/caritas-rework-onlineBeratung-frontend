import { test } from '@playwright/test';
import { registerByLink } from '../helpers/registerByLink';

test('Registration via agency link', async ({ browser }) => {
	await registerByLink(browser, '.profile__user__personal_link .text--right');
});
