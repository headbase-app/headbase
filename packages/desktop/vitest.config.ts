import { defineConfig } from 'vitest/config'
import {resolve} from "node:path";

export default defineConfig({
	test: {
		projects: [
			// Main Process - Unit tests in Node.js environment
			{
				test: {
					name: 'unit-main',
					include: ['src/main/**/*.unit.test.ts'],
					environment: 'node'
				}
			},
			// Render Process - Unit tests in web environment (using browser mode)
			{
				test: {
					name: 'unit-browser',
					include: ['src/renderer/**/*.unit.test.{ts,tsx}'],
					browser: {
						enabled: true,
						provider: 'playwright',
						headless: true,
						instances: [
							{browser: 'chromium'}
						]
					},
					alias: {
						'@renderer': resolve('src/renderer/src')
					}
				}
			},
		],
	},
})
