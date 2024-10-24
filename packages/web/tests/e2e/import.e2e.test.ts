import { test } from '@playwright/test';
import { setupTestVault } from "./helpers/setup-test-vault";
import path from "node:path";

test('can import database from json file',async ({ page }) => {
	await setupTestVault(page);

	await page.getByLabel('Open Settings').click()

	await page.getByRole('button', { name: 'Import/Export' }).click()

	await page.getByLabel('Upload File').setInputFiles(path.join(import.meta.dirname, "./helpers/vault-export.json"))

	await page.getByRole('button', { name: 'Import', exact: true }).click()
})
