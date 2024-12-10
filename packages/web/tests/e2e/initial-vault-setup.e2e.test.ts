import { test, expect } from "@playwright/test";
import { setupTestVault } from "./helpers/setup-test-vault";

test('can setup and open initial vault', async ({ page }) => {
	await setupTestVault(page)
});

test('can setup and open initial vault via keyboard', async ({ page }) => {
	await page.goto('/');

	// Expect that the database popup has automatically opened
	await expect(page.getByRole('heading', { name: 'Manage databases' })).toBeVisible()

	// The create database button should have initial focus, so just click it
	await page.keyboard.press("Enter")

	// Tab to name tooltip then name field
	await page.keyboard.press("Tab")
	await page.keyboard.press("Tab")

	await page.locator('*:focus').fill('testing vault')

	// Tab to sync enabled checkbox
	await page.keyboard.press("Tab")

	// Open "Sync Enabled?" and select no
	await page.locator('*:focus').selectOption({label: "No"})

	// To next step
	await page.keyboard.press("Tab")
	await page.keyboard.press("Enter")

	// Type password then confirm password
	await page.keyboard.press("Tab")
	await page.locator('*:focus').fill('password1234!')
	await page.keyboard.press("Tab")
	await page.locator('*:focus').fill('password1234!')

	// Submit form
	await page.keyboard.press("Enter")

	// Expect that the database will have been created and the database list is now showing
	await expect(page.getByRole('heading', { name: 'testing vault' })).toBeVisible()

	// Move to database "open" button and click
	await page.keyboard.press("Tab")
	await page.keyboard.press("Tab")
	await page.keyboard.press("Tab")
	await page.keyboard.press("Tab")
	await page.keyboard.press("Enter")

	// Expect that the database has been opened, so will now appear in the sidebar
	await expect(page.getByRole('button', { name: 'testing vault' })).toBeVisible()
});
