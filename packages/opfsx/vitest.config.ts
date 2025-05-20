import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      screenshotFailures: false,
      // https://vitest.dev/guide/browser/playwright
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },
        // todo: webkit tests fail with out of memory issue
        // { browser: 'webkit' },
      ],
    },
  },
})
