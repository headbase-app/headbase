import { test, expect, _electron as electron } from "@playwright/test"


test('example test', async ({trace}) => {
	const electronApp = await electron.launch({ args: ['./out/main/index.js'] })
	const isPackaged = await electronApp.evaluate(async ({ app }) => {
		// This runs in Electron's main process, parameter here is always
		// the result of the require('electron') in the main app script.
		return app.isPackaged
	})
	expect(isPackaged).toBe(false)

	const window = await electronApp.firstWindow()

	// Manually starting tracing to fix issue where snapshots don't show in timeline, see:
	// https://github.com/microsoft/playwright/issues/31393#issuecomment-2213231686
	// https://github.com/microsoft/playwright/pull/31437/files#diff-e2d41da267d99a638c95d506a28c9bdc5baec7ed34209f91badf95315122996bR54
	if (trace) {
		await window.context().tracing.start({screenshots: true, snapshots: true})
	}

	// tests go here
	await expect(window).toHaveTitle('Headbase')
	await window.screenshot({ path: './tests/screenshots/intro.png' })

	const path = test.info().outputPath('electron-trace.zip');
	if (trace) {
		await window.context().tracing.stop({path})
		test.info().attachments.push({ name: 'trace', path, contentType: 'application/zip' })
	}

	// close app
	await electronApp.close()
})
