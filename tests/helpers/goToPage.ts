import { Page } from '@playwright/test';
import { caritasRework } from '../config';

export async function goToPage(page: Page, path: string) {
	const env = process.env.TEST_ENV || 'dev';
	const baseURL = caritasRework[env];
	await page.goto(`${baseURL}${path}`);
}
