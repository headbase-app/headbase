import { defineConfig } from 'vitest/config'

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
					include: ['src/renderer/**/*.unit.test.ts'],
					browser: {
						enabled: true,
						instances: [
							{browser: 'chromium'}
						]
					}
				}
			},
		],
	},
})
