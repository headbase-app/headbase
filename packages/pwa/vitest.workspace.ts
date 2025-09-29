import { defineWorkspace } from 'vitest/config'


export default defineWorkspace([
  {
    extends: "vite.config.ts",
    test: {
      name: "Unit Tests",
      environment: "happy-dom",
      include: ["**/*.unit.test.{ts,tsx}"],
    }
  },
  {
    extends: "vite.config.ts",
    test: {
      name: "Browser Unit Tests",
      include: ["**/*.unit-web.test.{ts,tsx}"],
      browser: {
        provider: "playwright",
        enabled: true,
        headless: true,
        screenshotFailures: false,
        instances: [
          {browser: 'firefox'},
        ],
      },
    },
  },
])
