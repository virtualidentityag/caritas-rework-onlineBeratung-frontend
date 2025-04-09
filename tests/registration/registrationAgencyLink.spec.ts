import { test } from '@playwright/test';
import { registerByLink } from '../helpers/registerByLink';

// registration tests are skipped until deletion script is implemented
test.skip('Registration via agency link', async ({ browser }) => {
	await registerByLink(browser, '.profile__user__personal_link .text--right');
});
