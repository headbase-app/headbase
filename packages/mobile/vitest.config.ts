import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
	test: {
		projects: [
			{
				extends: "vite.config.ts",
				test: {
					name: "Unit Tests",
					environment: "happy-dom",
					include: ["**/*.unit.test.{ts,tsx}"],
				},
			},
			{
				extends: "vite.config.ts",
				test: {
					name: "Browser Unit Tests",
					include: ["**/*.unit-web.test.{ts,tsx}"],
					browser: {
						provider: playwright(),
						enabled: true,
						headless: true,
						screenshotFailures: false,
						instances: [
							{browser: 'chromium'},
							{browser: 'firefox'},
							{browser: 'webkit'},
						],
					},
				},
			}
		]
	}
})
