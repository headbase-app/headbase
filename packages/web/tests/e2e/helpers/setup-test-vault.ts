import { expect, Page } from "@playwright/test";

export async function setupTestVault(page: Page): Promise<void> {
	await page.goto('/');

	// Expect that the database popup has automatically opened
	await expect(page.getByRole('heading', { name: 'Database Manager' })).toBeVisible()

	await page.getByRole('button', { name: 'Create' }).click()

	await page.getByLabel('Name').fill('testing vault')
	await page.getByLabel('Sync Enabled?').selectOption({ label: 'No' })

	await page.getByRole('button', { name: 'Next Step' }).click()

	await page.getByLabel('Password', { exact: true }).fill('testing1234!')
	await page.getByLabel('Confirm Password').fill('testing1234!')

	await page.getByRole('button', { name: 'Create Database' }).click()

	// Expect that the database will have been created and the database list is now showing
	await expect(page.getByRole('heading', { name: 'testing vault' })).toBeVisible()

	await page.getByRole('button', { name: 'Open' }).click()

	// Expect that the database has been opened, so will now appear in the sidebar
	await expect(page.getByRole('button', { name: 'testing vault' })).toBeVisible()
}